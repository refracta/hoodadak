import React, {MouseEventHandler} from 'react';
import {Box} from '@mui/material';
import Aside from "../sidebar/Aside";
import {AppProps} from "../../types/hoodadak-client";
import ChatPage from "../pages/ChatPage";

export default function Main({context, children, modeChangeHandler}: AppProps & {
    children?: React.ReactNode,
    modeChangeHandler?: MouseEventHandler<HTMLButtonElement>
}) {
    return (
        <Box sx={{display: 'flex', height: '100vh', overflowY: 'hidden'}}>
            <Aside context={context}/>
            <ChatPage context={context} modeChangeHandler={modeChangeHandler}>{children}</ChatPage>
        </Box>
    );
};
