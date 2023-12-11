import {RawData} from 'ws';
import {DateUtils} from '../../../utils/DateUtils';
import {
    WSLoginMessage,
    WSMessageType,
    WSRTCICEExchangeMessage,
    WSRTCSDPExchangeMessage,
    WSSelectUserMessage
} from "../../../types/hoodadak";
import {DefaultWSocket, DefaultWSServer, WebSocketHandle, WebSocketHandler} from "../../../types/hoodadak-server";
import {createHash} from 'crypto';

export default class DefaultWSHandler implements WebSocketHandler<DefaultWSServer, DefaultWSocket> {
    readonly handles: { [messageType: string]: WebSocketHandle } = {};

    constructor() {
        this.handles[WSMessageType.LOGIN] = async (server: DefaultWSServer, socket: DefaultWSocket, data: WSLoginMessage) => {
            let user = data.user;
            let otherSessions = server.sockets.filter(s => s.data?.user?.uuid === user.uuid);
            server.manager.sendKick('A duplicate session has been detected, and the connection has been terminated. Refresh the page to reconnect.', otherSessions);
            otherSessions.forEach(s => s.close());
            otherSessions.forEach(s => delete s.data.user);

            let existUser = server.sockets.find(s => s.data?.user?.name === user.name)?.data?.user;
            if ((!existUser && data.user.uuid) || (existUser?.uuid === user.uuid)) {
                user.hash = createHash('sha512').update(user.name + user.uuid).digest('hex');
                socket.data.user = data.user;
                server.manager.sendUsers();
                console.log(`Login - ${JSON.stringify(data.user)}`);
            } else {
                server.manager.sendKick('Someone who uses the same name already exists. Delete your browser data to use a new name, or try to connect later.', [socket]);
            }
        };

        function getCoupledInfo(server: DefaultWSServer, socket: DefaultWSocket) {
            let user = socket.data.user;
            let selectedUserSocket = server.sockets.find(s => s.data?.user?.hash === user.selectedUser.hash);
            let isCoupled = false;
            if (selectedUserSocket) {
                let selectedUser = selectedUserSocket.data?.user;
                isCoupled = selectedUser?.selectedUser?.hash === user.hash;
                if (isCoupled) {
                    return {isCoupled, userSocket: socket, user, selectedUser, selectedUserSocket}
                }
            }
            return {isCoupled};
        }

        this.handles[WSMessageType.SELECT_USER] = async (server: DefaultWSServer, socket: DefaultWSocket, data: WSSelectUserMessage) => {
            socket.data.user.selectedUser = data.user;
            server.manager.sendUsers();

            let {user, selectedUser, isCoupled, selectedUserSocket} = getCoupledInfo(server, socket);
            if (isCoupled) {
                server.manager.sendUsers();
                server.manager.sendRTCStart([selectedUserSocket]);
                console.log(user.name, selectedUser.name);
            }
        };

        this.handles[WSMessageType.RTC_SDP_EXCHANGE] = async (server: DefaultWSServer, socket: DefaultWSocket, data: WSRTCSDPExchangeMessage) => {
            let {user, selectedUser, isCoupled, selectedUserSocket} = getCoupledInfo(server, socket);
            if (isCoupled) {
                server.manager.sendRTCSDPExchange(data.mode, data.sdp, [selectedUserSocket]);
                console.log(`[${data.mode}] SDP ${data.sdp?.type?.toUpperCase()} ${socket.data.user.name} > ${selectedUserSocket?.data.user.name}`);
            }
        }

        this.handles[WSMessageType.RTC_ICE_EXCHANGE] = async (server: DefaultWSServer, socket: DefaultWSocket, data: WSRTCICEExchangeMessage) => {
            let {user, selectedUser, isCoupled, selectedUserSocket} = getCoupledInfo(server, socket);
            if (isCoupled) {
                server.manager.sendRTCICEExchange(data.mode, data.candidate, [selectedUserSocket]);
            }
        }
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
        delete socket.data.user;
        server.manager.sendUsers();
    }
}

