export enum WSMessageType {
    HELLO = 'Hello',
    READY = 'Ready',
    PATH = 'Path',
}

export type WSMessage = {
    msg: string;
} & any;

export type WSReadyMessage = {
    msg: WSMessageType.READY;
};

export type WSHelloMessage = {
    msg: WSMessageType.HELLO;
};