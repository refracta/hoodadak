import React, {MouseEventHandler, useContext} from "react";
import {AppBar, Box, createTheme, IconButton, Toolbar, Typography, useMediaQuery, useTheme} from "@mui/material";
import UserIcon from "../icons/UserIcon";
import {Link} from "react-router-dom";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MenuIcon from "@mui/icons-material/Menu";
import background from "../../assets/background.svg";
import {GlobalContext} from "../../App";
import {getStatusColor} from "../utils/ColorUtils";

export default function ChatPage({children, modeChangeHandler}: {
    children?: React.ReactNode,
    modeChangeHandler?: MouseEventHandler<HTMLButtonElement>
}) {
    const context = useContext(GlobalContext);
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

    let {chat, connectionStatus, mode, setToggled} = context;
    const chatContainerStyle: React.CSSProperties = {
        backgroundColor: '#ffffff',
        backgroundImage: `url(${background})`,
        color: '#44596e',
        height: isSmUp ? 'calc(100% - 64px)' : 'calc(100% - 56px)',
        margin: 0,
        overflowY: 'auto',
        padding: 0,
        width: '100%'
    };
    return (
        <Box component="main" sx={{flexGrow: 1, width: '100%'}}>
            <AppBar position="relative">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        {chat ?
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <UserIcon user={chat.user} statusColor={getStatusColor(context)}/>
                                <div style={{marginLeft: '10px'}}>
                                    <div style={{fontWeight: 'bold', fontSize: '20px'}}>
                                        {chat.user.name}
                                    </div>
                                </div>
                            </div>
                            :
                            <Link to="/" style={{textDecoration: 'none', color: 'inherit'}}>HOODADAK</Link>}
                    </Typography>

                    {chat && <IconButton
                        disabled={connectionStatus === 'disconnected'}
                        edge="end"
                        color="inherit"
                        aria-label="videocall"
                        onClick={modeChangeHandler}
                    >
                        {mode === 'chat' ? <VideoCallIcon/> : <CallEndIcon/>}
                    </IconButton>}
                    {!isMdUp && (
                        <IconButton style={{marginLeft: '5px'}}
                                    edge="end"
                                    color="inherit"
                                    aria-label="menu"
                                    onClick={() => setToggled(true)}>
                            <MenuIcon/>
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>
            <div style={chatContainerStyle} className='topography-pattern'>
                {children}
            </div>
        </Box>
    );
}