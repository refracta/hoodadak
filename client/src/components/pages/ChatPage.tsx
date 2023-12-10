import React, {MouseEventHandler} from "react";
import {AppBar, Box, createTheme, IconButton, Toolbar, Typography, useMediaQuery, useTheme} from "@mui/material";
import UserIcon from "../icons/UserIcon";
import {Link} from "react-router-dom";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MenuIcon from "@mui/icons-material/Menu";
import background from "../../assets/background.svg";
import {AppProps} from "../../types/hoodadak-client";

export default function ChatPage({context, children, modeChangeHandler}: AppProps & {
    children?: React.ReactNode,
    modeChangeHandler?: MouseEventHandler<HTMLButtonElement>
}) {
    const defaultTheme = useTheme();
    const theme = createTheme({
        breakpoints: {
            values: {
                xs: 0,
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200,
            },
        },
    });
    const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
    const isSmUp = useMediaQuery(defaultTheme.breakpoints.up('sm'));

    let {chat, user, users} = context;
    let targetUser = users.find(u => u.hash === chat?.user.hash);
    let isSelectedMe = targetUser?.selectedUser?.hash === user?.hash;
    let statusColor;
    if (context.connectionStatus === 'connected') {
        statusColor = 'green';
    } else if (isSelectedMe) {
        statusColor = 'orange';
    } else if (targetUser) {
        statusColor = 'red';
    }

    return (<Box component="main" sx={{flexGrow: 1, width: '100%'}}>
        <AppBar position="relative">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    {chat ?
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <UserIcon user={chat.user} statusColor={statusColor}/>
                            <div style={{marginLeft: '10px'}}>
                                <div style={{
                                    fontWeight: 'bold',
                                    fontSize: '20px'
                                }}>{chat.user.name}</div>
                            </div>
                        </div>
                        :
                        <Link to="/" style={{textDecoration: 'none', color: 'inherit'}}>HOODADAK</Link>}
                </Typography>

                {chat && <IconButton
                    disabled={context.connectionStatus === 'disconnected'}
                    edge="end"
                    color="inherit"
                    aria-label="videocall"
                    onClick={modeChangeHandler}
                >
                    {context.mode === 'chat' ? <VideoCallIcon/> : <CallEndIcon/>}
                </IconButton>}
                {!isMdUp && (
                    <IconButton style={{marginLeft: '5px'}}
                                edge="end"
                                color="inherit"
                                aria-label="menu"
                                onClick={() => context.setToggled(true)}
                    >
                        <MenuIcon/>
                    </IconButton>
                )}
            </Toolbar>
        </AppBar>
        <div style={{
            color: '#44596e',
            overflowY: 'auto',
            height: isSmUp ? 'calc(100% - 64px)' : 'calc(100% - 56px)',
            width: '100%',
            margin: 0,
            padding: 0,
            backgroundColor: '#ffffff',
            backgroundImage: `url(${background})`
        }} className='topography-pattern'>
            {children}
        </div>
    </Box>)
}