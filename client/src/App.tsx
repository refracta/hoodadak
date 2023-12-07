import React, {useEffect, useState} from 'react';
import './App.css';
import './styles/App.scss';
import {initDB, useIndexedDB} from "react-indexed-db-hook";
import {DBConfig} from "./db/DBConfig";
import StartPage from "./pages/StartPage";
import {User} from "./types/hoodadak";
import Main from "./components/base/Main";

initDB(DBConfig);

function App() {
    const userDB = useIndexedDB('user');
    const [user, setUser] = useState<User>();
    useEffect(() => {
        (async () => {
            let user = (await userDB.getAll())[0];
            setUser(user);
        })();
    }, []);

    if (user) {
        return <Main/>;
    } else {
        return <StartPage setUser={setUser}/>;
    }

}

export default App;
