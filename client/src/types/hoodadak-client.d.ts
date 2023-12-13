import {Dispatch, SetStateAction} from "react";
import {Chat, Message, Setting, User} from "./hoodadak";
import {JsonValue, ReadyState, SendJsonMessage, SendMessage, WebSocketLike} from "react-use-websocket";
import {Key} from "react-indexed-db-hook/lib/indexed-db";
import WSManager from "../network/WSManager";

export type IndexedDB = {
    add: <T = any>(value: T, key?: any) => Promise<number>,
    clear: () => Promise<any>,
    deleteRecord: (key: Key) => Promise<any>,
    getAll: <T = any>() => Promise<T[]>,
    getByID: <T = any>(id: (number | string)) => Promise<T>,
    getByIndex: (indexName: string, key: any) => Promise<any>,
    openCursor: (cursorCallback: (event: Event) => void, keyRange?: IDBKeyRange) => Promise<void>,
    update: <T = any>(value: T, key?: any) => Promise<any>
};

export type AppContext = {
    chat: Chat | undefined;
    chats: Chat[];
    chatsDB: IndexedDB,
    connectionStatus: 'connected' | 'disconnected';
    getWebSocket: () => (WebSocketLike | null);
    lastJsonMessage: JsonValue | null;
    lastMessage: MessageEvent<any> | null;
    messages: Message[];
    messagesDB: IndexedDB;
    mode: 'chat' | 'video';
    readyState: ReadyState;
    sendJsonMessage: SendJsonMessage;
    sendMessage: SendMessage;
    setChat: Dispatch<SetStateAction<Chat | undefined>>;
    setChats: Dispatch<SetStateAction<Chat[]>>;
    setConnectionStatus: Dispatch<SetStateAction<'connected' | 'disconnected'>>;
    setMessages: Dispatch<SetStateAction<Message[]>>;
    setMode: Dispatch<SetStateAction<'chat' | 'video'>>;
    setSetting: (setting: Setting) => void;
    setToggled: Dispatch<SetStateAction<boolean>>;
    setUser: (user: User) => void;
    setUsers: Dispatch<SetStateAction<User[]>>;
    setting: Setting | undefined;
    settingDB: IndexedDB;
    settingData: Setting[];
    toggled: boolean;
    user: User | undefined;
    userDB: IndexedDB;
    users: User[];
    wsManager: WSManager;
}

export type  DataChannelConfigurator = (receiveChannel: RTCDataChannel, sendChannel :RTCDataChannel) => void;
