import WSManager from '../../manager/WSManager';
import {DefaultWSocket} from '../../../types/hoodadak-server';
import {
    RTCConnectionMode,
    WSKickMessage,
    WSMessageType, WSReadyMessage,
    WSRTCSDPExchangeMessage,
    WSRTCICEExchangeMessage,
    WSRTCStartMessage,
    WSUsersMessage
} from "../../../types/hoodadak";

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

    sendUsers(sockets: DefaultWSocket[] = this.getAllSockets()) {
        let filteredSockets = sockets.filter(s => s.data?.user?.uuid);
        for (let socket of filteredSockets) {
            let targetUsers = filteredSockets.map(s => ({
                ...s.data.user,
                uuid: undefined
            })).filter(u => u.name !== socket.data.user.name);
            this.json({msg: WSMessageType.USERS, users: targetUsers} as WSUsersMessage, [socket]);
        }
    }

    sendRTCStart(sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.RTC_START} as WSRTCStartMessage, sockets);
    }

    sendRTCSDPExchange(mode: RTCConnectionMode, sdp: RTCSessionDescription, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.RTC_SDP_EXCHANGE, mode, sdp} as WSRTCSDPExchangeMessage, sockets);
    }

    sendRTCICEExchange(mode: RTCConnectionMode, candidate: RTCIceCandidate, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.RTC_ICE_EXCHANGE, mode, candidate} as WSRTCICEExchangeMessage, sockets);
    }

    sendKick(reason: string, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.KICK, reason} as WSKickMessage, sockets);
    }
}