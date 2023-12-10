import React, {createContext, useState} from 'react';
import './App.css';
import './styles/App.scss';
import {initDB, useIndexedDB} from "react-indexed-db-hook";
import {DBConfig} from "./db/DBConfig";
import StartPage from "./components/pages/StartPage";
import Main from "./components/base/Main";
import useWebSocket from "react-use-websocket";
import {Chat, Message, User, WSMessage} from "./types/hoodadak";
import {AppContext} from "./types/hoodadak-client";
import useDatabaseData from "./hooks/useDatabaseData";

const getWSEntrypoint = () => {
    let entrypoint = process.env.REACT_APP_BACKEND_ENTRYPOINT;
    entrypoint = entrypoint ? entrypoint : window.location.host;
    entrypoint = entrypoint.includes('://') ? entrypoint : window.location.protocol.startsWith('https') ? 'wss://' : 'ws://' + entrypoint;
    entrypoint += '/websocket';
    return entrypoint;
}

const getIceServers = () => {
    return process.env.REACT_APP_ICE_SERVERS.split(',').map(s => {
        let serverInfo = s.split(':');
        let [type, host, port, username, credential] = serverInfo;
        let urls = `${type}:${host}${port ? ':' + port : ''}`;
        return {urls, username, credential};
    }).filter(server => server.urls);
}

initDB(DBConfig);
export const GlobalContext = createContext<AppContext>({} as AppContext);
export default function App() {
    const userDB = useIndexedDB('user');
    const chatsDB = useIndexedDB('chats');
    const messagesDB = useIndexedDB('messages');
    const [userData, setUserData] = useDatabaseData<User>(userDB);
    const [user, setUser] = [userData[0], (user: User) => setUserData([user])]
    const [users, setUsers] = useState<User[]>([]);
    const [chat, setChat] = useState<Chat>();
    const [chats, setChats] = useDatabaseData<Chat>(chatsDB);
    const [messages, setMessages] = useDatabaseData<Message>(messagesDB);
    const [toggled, setToggled] = useState<boolean>(false);
    const [mode, setMode] = useState<'chat' | 'video'>('chat');
    const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'disconnected'>('disconnected');

    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket
    } = useWebSocket<WSMessage>(getWSEntrypoint(), {
        shouldReconnect: (closeEvent) => true,
        share: true
    });

    const context: AppContext = {
        chat,
        chats,
        chatsDB,
        connectionStatus,
        getWebSocket,
        lastJsonMessage,
        lastMessage,
        messages,
        messagesDB,
        mode,
        readyState,
        sendJsonMessage,
        sendMessage,
        setChat,
        setChats,
        setConnectionStatus,
        setMessages,
        setMode,
        setToggled,
        setUser,
        setUsers,
        toggled,
        user,
        userDB,
        users
    };

    return (
        <GlobalContext.Provider value={context}>
            {user ?
                (<Main/>) :
                (<StartPage/>)}
        </GlobalContext.Provider>
    );
}
