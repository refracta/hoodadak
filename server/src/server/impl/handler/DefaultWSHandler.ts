import {RawData} from 'ws';
import {DateUtils} from '../../../utils/DateUtils';
import {WSHelloMessage, WSMessageType} from "../../../types/hoodadak";
import {DefaultWSocket, DefaultWSServer, WebSocketHandle, WebSocketHandler} from "../../../types/hoodadak-server";


export default class DefaultWSHandler implements WebSocketHandler<DefaultWSServer, DefaultWSocket> {
    readonly handles: { [messageType: string]: WebSocketHandle } = {};

    constructor() {
        this.handles[WSMessageType.HELLO] = async (server: DefaultWSServer, socket: DefaultWSocket, data: WSHelloMessage) => {
            console.log(`[${DateUtils.getConsoleTime()}]`, data);
        };
    }

    onReady(server: DefaultWSServer, socket: DefaultWSocket) {
        server.manager.ready([socket]);
    }

    onMessage(server: DefaultWSServer, socket: DefaultWSocket, rawData: RawData, isBinary: boolean) {
        const message = JSON.parse(rawData.toString());
        try {
            this.handles[message.msg](server, socket, message);
        } catch (e) {
            console.error(`[${DateUtils.getConsoleTime()} | WebSocket, ${socket.req.ip}] onMessage - Message: ${JSON.stringify(message)}`);
        }
    }

    onClose(server: DefaultWSServer, socket: DefaultWSocket, code: number, reason: Buffer) {
        /* empty */
    }
}

