import React, {useContext, useEffect, useState} from 'react';
import {Box} from '@mui/material';
import Aside from "../sidebar/Aside";
import ChatPage from "../pages/ChatPage";
import KickOverlay from "../overlay/KickOverlay";
import {WSMessage, WSMessageType} from "../../types/hoodadak";
import {GlobalContext} from "../../App";

export default function Main() {
    const context = useContext(GlobalContext);
    const {lastJsonMessage} = context;
    const [kickReason, setKickReason] = useState<string | undefined>(undefined);

    useEffect(() => {
        let message: WSMessage = lastJsonMessage;
        if (message?.msg === WSMessageType.KICK) {
            setKickReason(message.reason);
        }
    }, [lastJsonMessage]);

    return (
        <Box sx={{display: 'flex', height: '100vh', overflowY: 'hidden'}}>
            {kickReason && <KickOverlay reason={kickReason}/>}
            <Aside/>
            <ChatPage/>
        </Box>
    );
};
