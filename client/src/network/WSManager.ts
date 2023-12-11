import {
    RTCConnectionMode,
    User,
    WSLoginMessage,
    WSMessageType,
    WSRTCICEExchangeMessage,
    WSRTCSDPExchangeMessage,
    WSSelectUserMessage
} from "../types/hoodadak";

export default class WSManager {
    private readonly sendHandler: (data: any) => void;

    json(data: any) {
        this.sendHandler(data);
    }

    constructor(sendHandler: (data: any) => void) {
        this.sendHandler = sendHandler;
    }

    sendLoginMessage(user: User) {
        this.json({msg: WSMessageType.LOGIN, user} as WSLoginMessage);
    }

    sendSelectUserMessage(user: User) {
        this.json({msg: WSMessageType.SELECT_USER, user} as WSSelectUserMessage);
    }

    sendRTCICEExchangeMessage(mode: RTCConnectionMode, candidate: RTCIceCandidate) {
        this.json({
            msg: WSMessageType.RTC_ICE_EXCHANGE,
            mode,
            candidate
        } as WSRTCICEExchangeMessage);
    }

    sendRTCSDPExchangeMessage(mode: RTCConnectionMode, sdp: RTCSessionDescriptionInit) {
        this.json({
            msg: WSMessageType.RTC_SDP_EXCHANGE,
            sdp,
            mode
        } as WSRTCSDPExchangeMessage);
    }
}