import {RawData, WebSocket} from 'ws';
import {Socket} from 'net';
import WSServer from '../server/WSServer';
import DefaultWSManager from '../server/impl/manager/DefaultWSManager';
import * as express from 'express';
import {Application} from 'express';
import {Server} from 'http';
import {User} from "./hoodadak";

export type ISocket = Socket & { id: string };
export type IWSocket = WebSocket & { id: string, req: any };

export interface HTTPService {
    router: express.Router
}

export interface HTTPHandler {
    init: (app: Application, server: Server) => void,
}

export interface WebSocketHandler<Server, Socket> {
    onReady?: (server: Server, socket: Socket) => void,
    onMessage?: (server: Server, socket: Socket, message: RawData, isBinary: boolean) => void,
    onClose?: (server: Server, socket: Socket, code: number, reason: Buffer) => void,
}

export type DefaultWSServer = WSServer<DefaultWSData, DefaultWSManager>;
export type DefaultWSData = {
    user: User;
};
export type DefaultWSocket = IWSocket & { data: DefaultWSData };
export type WebSocketHandle = (server: DefaultWSServer, socket: DefaultWSocket, data: any) => void;
