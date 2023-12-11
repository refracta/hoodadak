export enum WSMessageType {
    READY = 'Ready',
    LOGIN = 'Login',
    KICK = 'Kick',
    USERS = 'Users',
    SELECT_USER = 'SelectUser',
    RTC_START = 'RTCStart',
    RTC_SDP_EXCHANGE = 'RTCSDPExchange',
    RTC_ICE_EXCHANGE = 'RTCICEExchange',
}

export type WSReadyMessage = {
    msg: WSMessageType.READY;
};

export type WSMessage = {
    msg: string;
} & any;

export type User = {
    hash?: string;
    id?: number;
    name: string;
    selectedUser?: User;
    uuid?: string
}
export type Chat = {
    id?: number;
    lastMessage: string;
    lastMessageTime?: Date;
    user: User
}
export type MessageType = 'text' | 'file' | 'image' | 'video' | 'audio';
export type Message = {
    data: {
        isMe?: boolean;
        name?: string;
        raw: any;
        time: Date;
        type: MessageType
    };
    user: User
}

export type RTCConnectionMode = 'chat' | 'video';
export type WSLoginMessage = {
    msg: WSMessageType.LOGIN;
    user: User
};

export type WSKickMessage = {
    msg: WSMessageType.KICK;
    reason: string;
};

export type WSUsersMessage = {
    msg: WSMessageType.USERS;
    users: User[];
};

export type WSSelectUserMessage = {
    msg: WSMessageType.SELECT_USER;
    user: User
};

export type WSRTCStartMessage = {
    msg: WSMessageType.RTC_START;
};

export type WSRTCSDPExchangeMessage = {
    msg: WSMessageType.RTC_SDP_EXCHANGE;
    sdp: RTCSessionDescription;
    mode: RTCConnectionMode;
};

export type WSRTCICEExchangeMessage = {
    msg: WSMessageType.RTC_ICE_EXCHANGE;
    candidate: RTCIceCandidate;
    mode: RTCConnectionMode;
};

export enum RTCMessageType {
    CHANGE_MODE = 'ChangeMode',
    SEND_MSG = 'SendMsg',
    FILE_START = 'FileStart',
    FILE_COMPLETE = 'FileComplete'
}

export type RTCChangeModeMessage = {
    msg: RTCMessageType.CHANGE_MODE;
    mode: RTCConnectionMode;
};

export type RTCSendMsgMessage = {
    msg: RTCMessageType.SEND_MSG;
    message: Message;
};

export type RTCFileStartMessage = {
    msg: RTCMessageType.FILE_START;
    size: number;
};

export type RTCFileCompleteMessage = {
    msg: RTCMessageType.FILE_COMPLETE;
};
