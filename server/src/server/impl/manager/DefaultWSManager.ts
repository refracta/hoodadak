import WSManager from '../../manager/WSManager';
import {DefaultWSocket} from '../../../types/hoodadak-server';
import {
    WSKickMessage,
    WSMessageType,
    WSReadyMessage,
    WSRTCICEExchangeMessage,
    WSRTCSDPExchangeMessage,
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

    sendRTCStart(mode: 'chat' | 'video', sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.RTC_START, mode} as WSRTCStartMessage, sockets);
    }

    sendRTCSDPExchange(sdp: RTCSessionDescription, mode: 'chat' | 'video', sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.RTC_SDP_EXCHANGE, sdp, mode} as WSRTCSDPExchangeMessage, sockets);
    }

    sendRTCICEExchange(candidate: RTCIceCandidate, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.RTC_ICE_EXCHANGE, candidate} as WSRTCICEExchangeMessage, sockets);
    }

    sendKick(reason: string, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.KICK, reason} as WSKickMessage, sockets);
    }
}