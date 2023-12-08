import React, {useEffect, useState} from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import './styles/App.scss';
import {initDB, useIndexedDB} from "react-indexed-db-hook";
import {DBConfig} from "./db/DBConfig";
import StartPage from "./pages/StartPage";
import {User} from "./types/hoodadak-client";
import Main from "./components/base/Main";
import {MessageBox} from "react-chat-elements";
import UserIcon from "./components/icons/UserIcon";
import useWebSocket from "react-use-websocket";
import {WSMessage} from "./types/hoodadak";

initDB(DBConfig);

function App() {
    const {
        lastJsonMessage,
        sendJsonMessage
    } = useWebSocket<WSMessage>((window.location.protocol.startsWith('https') ? 'wss://' : 'ws://') + window.location.host + '/websocket', {
        shouldReconnect: (closeEvent) => true,
        share: true
    });
    console.log(lastJsonMessage);
    sendJsonMessage({msg: 'Hello'});
    // TODO: 한명만 커넥션 유지

    const userDB = useIndexedDB('user');
    const [user, setUser] = useState<User>();
    useEffect(() => {
        (async () => {
            let user = (await userDB.getAll())[0];
            setUser(user);
        })();
    }, [userDB]);

    if (user) {
        return <Main>
            <UserIcon name={'테 스 트'}/>
            <MessageBox type={"text"} id={1} position={'right'} text={'hello'} title={'title'} focus={false}
                        date={new Date()} titleColor={'black'} forwarded={false} replyButton={false}
                        removeButton={false} status={'sent'} notch={false} retracted={false}/>
        </Main>;
    } else {
        return <StartPage setUser={setUser}/>;
    }

}

export default App;
