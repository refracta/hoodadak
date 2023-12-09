import React, {useEffect, useState} from 'react';
import {Menu, menuClasses, Sidebar} from 'react-pro-sidebar';
import UserChatMenu from "./menu/UserChatMenu";
import UserNameMenu from "./menu/UserNameMenu";
import {Box, Card, CardContent, Tab, Tabs} from '@mui/material';
import {AppProps} from "../../types/hoodadak-client";
import {Chat} from "../../types/hoodadak";
import {TimeUtils} from "../../utils/TimeUtils";

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

export default function Aside({context}: AppProps) {
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    const [activeTab, setActiveTab] = useState<string>('user');

    const handleResize = () => {
        setWindowWidth(window.innerWidth);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <Sidebar
            width={getSideBarWidth(windowWidth)}
            toggled={context.toggled}
            onBackdropClick={() => context.setToggled(false)}
            breakPoint="md"
            backgroundColor='#ffffff'
            rootStyles={{
                [`.${menuClasses.button}:hover`]: {
                    backgroundColor: '#dfefff !important',
                },
                [`.${menuClasses.active}`]: {
                    backgroundColor: '#dfefff',
                }
            }}
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
                            <Tab value="user" label={`User (${context.users.length})`}/>
                            <Tab value="chat" label="Chat"/>
                            {/*<Tab value="setting" label="Setting"/>*/}
                        </Tabs>
                        <CardContent sx={{padding: 0, overflowY: 'auto', height: 'calc(100% - 48px)'}}>
                            {activeTab === 'user' && (
                                <Menu menuItemStyles={{
                                    button: {
                                        '&:hover': {
                                            backgroundColor: '#f3f3f3',
                                        },
                                        '&:active': {
                                            backgroundColor: '#f3f3f3',
                                        }
                                    }
                                }}>
                                    {context.users.map(user => <UserNameMenu statusColor={(() => {
                                        let {chat, user: currentUser, users} = context;
                                        let targetUser = users.find(u => u.hash === user.hash);
                                        let isSelectedMe = targetUser?.selectedUser?.hash === currentUser?.hash;
                                        let statusColor;
                                        if (context.connectionStatus === 'connected' && user.hash === chat?.user.hash) {
                                            statusColor = 'green';
                                        } else if (isSelectedMe) {
                                            statusColor = 'orange';
                                        } else if (targetUser) {
                                            statusColor = 'red';
                                        }
                                        return statusColor;
                                    })()} onClick={async () => {
                                        let chats = context.chats;
                                        let chat = chats.find(c => user.hash === c.user.hash);
                                        if (!chat) {
                                            chat = {user: user, lastMessage: ''};
                                            await context.chatsDB.add(chat);
                                            context.setChats(await context.chatsDB.getAll() as Chat[]);
                                        }
                                        context.setChat(chat);
                                        setActiveTab('chat');
                                    }} key={user.hash} user={user}/>)}
                                </Menu>
                            )}
                            {activeTab === 'chat' && (
                                <Menu>
                                    {context.chats.map(c => <UserChatMenu onClick={() => {
                                        context.setChat(c);
                                    }} active={context.chat?.user.hash === c.user.hash}
                                                                          key={c.user.hash}
                                                                          user={c.user}
                                                                          lastMessage={c.lastMessage}
                                                                          lastMessageTime={c.lastMessageTime ? TimeUtils.timeSince(c.lastMessageTime) : ''}
                                                                          statusColor={
                                                                              (() => {
                                                                                  let {chat, user, users} = context;
                                                                                  let targetUser = users.find(u => u.hash === c?.user.hash);
                                                                                  let isSelectedMe = targetUser?.selectedUser?.hash === user?.hash;
                                                                                  let statusColor;
                                                                                  if (context.connectionStatus === 'connected' && c.user.hash === chat?.user.hash) {
                                                                                      statusColor = 'green';
                                                                                  } else if (isSelectedMe) {
                                                                                      statusColor = 'orange';
                                                                                  } else if (targetUser) {
                                                                                      statusColor = 'red';
                                                                                  }
                                                                                  return statusColor;
                                                                              })()
                                                                          }/>)}
                                </Menu>
                            )}
                           {/* {activeTab === 'setting' && (
                                <></>
                            )}*/}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Sidebar>
    );
};