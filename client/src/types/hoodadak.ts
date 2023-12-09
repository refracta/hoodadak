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

export type User = { name: string, uuid?: string, hash?: string, selectedUser?: User }
export type Chat = { user: User, lastMessage: string, lastMessageTime?: Date }

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