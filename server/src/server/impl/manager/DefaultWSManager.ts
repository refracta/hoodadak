import WSManager from '../../manager/WSManager';
import {DefaultWSocket} from '../../../types/hoodadak-server';
import {WSHelloMessage, WSMessageType, WSReadyMessage} from "../../../types/hoodadak";

export default class DefaultWSManager extends WSManager {
    json(data: any, sockets: DefaultWSocket[] = this.getAllSockets()) {
        sockets.forEach(s => s.send(JSON.stringify(data)));
    }

    ready(sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.READY} as WSReadyMessage, sockets);
    }

    getAllSockets() {
        return this.server?.sockets as DefaultWSocket[];
    }

    sendHello(data: string, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.HELLO, data} as WSHelloMessage, sockets);
    }
}