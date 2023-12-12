import React, {useContext, useState} from 'react';
import {Menu, menuClasses, Sidebar} from 'react-pro-sidebar';
import UserChatMenu from "./menu/UserChatMenu";
import UserNameMenu from "./menu/UserNameMenu";
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Switch,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import {Chat, User} from "../../types/hoodadak";
import {GlobalContext} from "../../App";
import useWindowSize from "../../hooks/useWindowSize";
import {getStatusColor} from "../utils/ColorUtils";

const getSideBarWidth = (windowWidth: number) => {
    let width = '80vw';
    if (windowWidth > 1200) {
        width = '25vw'
    } else if (windowWidth > 992) {
        width = '30vw'
    } else if (windowWidth > 768) {
        width = '35vw'
    }
    return width;
}

export default function Aside() {
    const context = useContext(GlobalContext);
    const {
        user,
        setChat,
        users,
        setChats,
        setToggled,
        chatsDB,
        chats,
        chat,
        toggled,
        setting,
        settingDB,
        setSetting
    } = context;
    const [activeTab, setActiveTab] = useState<string>('user');
    const {width} = useWindowSize();
    const rootStyles = {
        [`.${menuClasses.button}:hover`]: {
            backgroundColor: '#dfefff !important',
        },
        [`.${menuClasses.active}`]: {
            backgroundColor: '#dfefff',
        }
    };
    const menuItemStyles = {
        button: {
            '&:hover': {
                backgroundColor: '#f3f3f3',
            },
            '&:active': {
                backgroundColor: '#f3f3f3',
            }
        }
    };

    const onUserNameMenuClick = async (user: User) => {
        let chat = chats.find(c => user.hash === c.user.hash);
        let nameBasedChat = chats.find(c => user.name === c.user.name && !c.user.hash);
        if (nameBasedChat) {
            chat = nameBasedChat;
        }
        if (!chat) {
            chat = {user, lastMessage: ''};
            let id = await chatsDB.add(chat);
            chat = {...chat, id};
            setChats(await chatsDB.getAll() as Chat[]);
        }
        setChat(chat);
        setActiveTab('chat');
    };

    chats.sort((c1: Chat, c2: Chat) => {
        let d1 = c1.lastMessageTime ? new Date(c1.lastMessageTime).getTime() : Number.MIN_VALUE;
        let d2 = c2.lastMessageTime ? new Date(c2.lastMessageTime).getTime() : Number.MIN_VALUE;
        return d2 - d1;
    });

    return (
        <Sidebar
            width={getSideBarWidth(width)}
            toggled={toggled}
            onBackdropClick={() => setToggled(false)}
            breakPoint="md"
            backgroundColor='#ffffff'
            rootStyles={rootStyles}
        >
            <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <Box sx={{flex: 1, height: '100%'}}>
                    <Card sx={{height: '100%'}}>
                        <Tabs
                            value={activeTab}
                            onChange={(event: React.SyntheticEvent, newValue: string) => {
                                setActiveTab(newValue);
                            }}
                            variant="fullWidth"
                            textColor="primary"
                            indicatorColor="primary"
                        >
                            <Tab value="user" label={`User (${users.length})`}/>
                            <Tab value="chat" label="Chat"/>
                            <Tab value="setting" label="Setting"/>
                        </Tabs>
                        <CardContent sx={{padding: 0, overflowY: 'auto', height: 'calc(100% - 48px)'}}>
                            {activeTab === 'user' && (
                                <Menu menuItemStyles={menuItemStyles}>
                                    {users.map(user =>
                                        <UserNameMenu
                                            statusColor={getStatusColor(context, user)}
                                            onClick={() => onUserNameMenuClick(user)}
                                            key={user.hash}
                                            user={user}
                                        />)
                                    }
                                </Menu>
                            )}
                            {activeTab === 'chat' && (
                                <Menu>
                                    {chats.map(c =>
                                        <UserChatMenu
                                            active={chat?.user.hash === c.user.hash}
                                            key={c.user.hash}
                                            user={c.user}
                                            lastMessage={c.lastMessage}
                                            lastMessageTime={c.lastMessageTime}
                                            statusColor={getStatusColor(context, c.user)}
                                            onClick={() => {
                                                setChat(c);
                                            }}
                                        />)
                                    }
                                </Menu>
                            )}
                            {activeTab === 'setting' && (
                                <div>
                                    <div
                                        style={{padding: '10px', margin: '10px', display: 'flex', flexDirection: 'column'}}>
                                        <Typography variant="h6" gutterBottom>
                                            User
                                        </Typography>
                                        <Menu>
                                            <UserChatMenu
                                                user={user!}
                                                lastMessage={`UUID: ${user?.uuid}`}
                                            />
                                        </Menu>
                                        <Typography style={{marginTop: '20px'}} variant="h6" gutterBottom>
                                            Settings
                                        </Typography>
                                        <List>
                                            <ListItem>
                                                <ListItemText primary="Use TURN server"/>
                                                <ListItemSecondaryAction>
                                                    <Switch
                                                        checked={setting?.useTURNServer}
                                                        onChange={
                                                            async (e, checked) => {
                                                                setting!.useTURNServer = checked;
                                                                await settingDB.update(setting);
                                                                setSetting(setting!);
                                                            }
                                                        }/>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Divider/>
                                            <ListItem>
                                                <ListItemText primary="Use waiting notification"/>
                                                <ListItemSecondaryAction>
                                                    <Switch
                                                        checked={setting?.useWaitingNotification}
                                                        onChange={
                                                            async (e, checked) => {
                                                                setting!.useWaitingNotification = checked;
                                                                await settingDB.update(setting);
                                                                setSetting(setting!);
                                                            }
                                                        }/>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <ListItem>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to delete all data?')) {
                                                            await context.userDB.clear();
                                                            await context.messagesDB.clear();
                                                            await context.chatsDB.clear();
                                                            await context.settingDB.clear();
                                                            window.location.reload();
                                                        }
                                                    }}
                                                    style={{width: '100%'}}
                                                >
                                                    Reset All Data
                                                </Button>
                                            </ListItem>
                                        </List>
                                        <Paper style={{padding: '20px', margin: '20px', marginTop: '20px'}}>
                                            <Typography style={{textAlign: 'center'}} variant="h6" gutterBottom>
                                                Hoodadak
                                            </Typography>
                                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                                <img src='logo.svg' style={{width: "40%"}} alt='logo'/>
                                            </div>
                                            <Typography variant="body1" style={{marginTop: '20px'}}>
                                                Hoodadak is a fast and lightweight direct messenger using WebRTC
                                                technology developed by refracta.
                                            </Typography>
                                            <Typography variant="body2"
                                                        style={{marginTop: '20px', textAlign: 'center'}}>
                                                Licensed under <a href="https://www.gnu.org/licenses/gpl-3.0.en.html"
                                                                  target="_blank" rel="noreferrer">GPLv3</a>. View the
                                                source on <a href="https://github.com/refracta/hoodadak" target="_blank"
                                                             rel="noreferrer">GitHub</a>.
                                            </Typography>
                                        </Paper>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Sidebar>
    );
};