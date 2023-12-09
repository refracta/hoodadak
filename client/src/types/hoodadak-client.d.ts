import {Dispatch, SetStateAction} from "react";
import {Chat, User} from "./hoodadak";
import {JsonValue, ReadyState, SendJsonMessage, SendMessage, WebSocketLike} from "react-use-websocket";

export type IndexedDB = {
    add: <T = any>(value: T, key?: any) => Promise<number>,
    getByID: <T = any>(id: (number | string)) => Promise<T>,
    getAll: <T = any>() => Promise<T[]>,
    update: <T = any>(value: T, key?: any) => Promise<any>,
    deleteRecord: (key: Key) => Promise<any>,
    openCursor: (cursorCallback: (event: Event) => void, keyRange?: IDBKeyRange) => Promise<void>,
    getByIndex: (indexName: string, key: any) => Promise<any>,
    clear: () => Promise<any>
};
export type AppContext = {
    toggled: boolean;
    setToggled: Dispatch<SetStateAction<boolean>>;
    connectionStatus: 'connected' | 'disconnected';
    setConnectionStatus: Dispatch<SetStateAction<'connected' | 'disconnected'>>;
    mode: 'chat' | 'video';
    setMode: Dispatch<SetStateAction<'chat' | 'video'>>;
    user: User | undefined;
    setUser: Dispatch<SetStateAction<User | undefined>>;
    chat: Chat | undefined;
    setChat: Dispatch<SetStateAction<Chat | undefined>>;
    chats: Chat[];
    setChats: Dispatch<SetStateAction<Chat[]>>;
    users: ModelData[];
    setUsers: Dispatch<SetStateAction<User[]>>;
    sendMessage: SendMessage;
    sendJsonMessage: SendJsonMessage;
    lastMessage: MessageEvent<any> | null;
    lastJsonMessage: JsonValue | null;
    readyState: ReadyState;
    getWebSocket: () => (WebSocketLike | null);
    userDB: IndexedDB;
    chatsDB: IndexedDB;
    messagesDB: IndexedDB;
}

export type AppProps = {
    context: AppContext
}
