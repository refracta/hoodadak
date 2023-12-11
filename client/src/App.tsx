import React, {createContext, useState} from 'react';
import './App.css';
import './styles/App.scss';
import {initDB, useIndexedDB} from "react-indexed-db-hook";
import {DBConfig} from "./db/DBConfig";
import StartPage from "./components/pages/StartPage";
import Main from "./components/base/Main";
import useWebSocket from "react-use-websocket";
import {Chat, Message, Setting, User, WSMessage} from "./types/hoodadak";
import {AppContext} from "./types/hoodadak-client";
import useDatabaseData from "./hooks/useDatabaseData";
import WSManager from "./network/WSManager";

const getWSEntrypoint = () => {
    let entrypoint = process.env.REACT_APP_BACKEND_ENTRYPOINT;
    entrypoint = entrypoint.replace('0.0.0.0', window.location.hostname)
    entrypoint = entrypoint ? entrypoint : window.location.host;
    entrypoint = entrypoint.includes('://') ? entrypoint : window.location.protocol.startsWith('https') ? 'wss://' : 'ws://' + entrypoint;
    entrypoint += '/websocket';
    return entrypoint;
}

initDB(DBConfig);
export const GlobalContext = createContext<AppContext>({} as AppContext);
export default function App() {
    const userDB = useIndexedDB('user');
    const chatsDB = useIndexedDB('chats');
    const messagesDB = useIndexedDB('messages');
    const settingDB = useIndexedDB('setting');
    const [userData, setUserData] = useDatabaseData<User>(userDB);
    const [user, setUser] = [userData[0], (user: User) => setUserData([user])]
    const [settingData, setSettingData] = useDatabaseData<Setting>(settingDB);
    const [setting, setSetting] = [settingData[0], (setting: Setting) => setSettingData([setting])]
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
        settingData,
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
        setSetting,
        setToggled,
        setUser,
        setUsers,
        setting,
        settingDB,
        toggled,
        user,
        userDB,
        users,
        wsManager: new WSManager(sendJsonMessage)
    };

    return (
        <GlobalContext.Provider value={context}>
            {user ?
                (<Main/>) :
                (<StartPage/>)}
        </GlobalContext.Provider>
    );
}
