export enum WSMessageType {
    HELLO = 'Hello',
    READY = 'Ready',
    LOGIN = 'Login',
    KICK = 'Kick',
    USERS = 'Users',
    SELECT_USER = 'SelectUser',
    RTC_START = 'RTCStart',
    RTC_SDP_EXCHANGE = 'RTCSDPExchange',
    RTC_ICE_EXCHANGE = 'RTCICEExchange',
}

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
export type Message = {
    data: {
        isMe?: boolean;
        name?: string;
        raw: any;
        time: Date;
        type: 'text' | 'file' | 'image' | 'video' | 'audio'
    };
    user: User
}

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
    mode: 'chat' | 'video'
};

export type WSRTCSDPExchangeMessage = {
    msg: WSMessageType.RTC_SDP_EXCHANGE;
    sdp: RTCSessionDescription;
    mode: 'chat' | 'video';
};

export type WSRTCICEExchangeMessage = {
    msg: WSMessageType.RTC_ICE_EXCHANGE;
    candidate: RTCIceCandidate;
};

export type WSReadyMessage = {
    msg: WSMessageType.READY;
};

export type WSHelloMessage = {
    msg: WSMessageType.HELLO;
};