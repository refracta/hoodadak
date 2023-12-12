import React, {useContext} from "react";
import {AppBar, createTheme, IconButton, Toolbar, Typography, useMediaQuery} from "@mui/material";
import UserIcon from "../../icons/UserIcon";
import {getStatusColor} from "../../utils/ColorUtils";
import {Link} from "react-router-dom";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MenuIcon from "@mui/icons-material/Menu";
import {GlobalContext} from "../../../App";

export default function ChatToolbar({onModeChangeClick}: { onModeChangeClick: () => void }) {
    const context = useContext(GlobalContext);
    let {chat, connectionStatus, mode, setToggled} = context;

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
    const isMdDown = useMediaQuery(theme.breakpoints.down('md'));

    const usernameStyle: React.CSSProperties = {
        fontWeight: 'bold',
        fontSize: '20px',
        width: '50vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    };
    return (
        <AppBar position="relative">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    {chat ?
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <UserIcon user={chat.user} statusColor={getStatusColor(context)}/>
                            <div style={{marginLeft: '10px'}}>
                                <div style={usernameStyle}>
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
                    onClick={onModeChangeClick}
                >
                    {mode === 'chat' ? <VideoCallIcon/> : <CallEndIcon/>}
                </IconButton>}
                {isMdDown && (
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
    );
}
