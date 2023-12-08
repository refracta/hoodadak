import React, {useEffect, useState} from 'react';
import {Menu, Sidebar} from 'react-pro-sidebar';
import UserChatMenu from "./menu/UserChatMenu";
import UserNameMenu from "./menu/UserNameMenu";
import {Box, Card, CardContent, Tab, Tabs} from '@mui/material';

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

export default function Aside({toggled, setToggled}: {
    toggled: boolean,
    setToggled: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    const [activeTab, setActiveTab] = useState<string>('user');
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

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
            toggled={toggled}
            onBackdropClick={() => setToggled(false)}
            breakPoint="md"
            backgroundColor='#ffffff'
            rootStyles={{
                color: '#607489',
            }}
        >
            <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <Box sx={{flex: 1, height: '100%'}}>
                    <Card sx={{height: '100%'}}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            textColor="primary"
                            indicatorColor="primary"
                        >
                            <Tab value="user" label="User"/>
                            <Tab value="chat" label="Chat"/>
                            <Tab value="setting" label="Setting"/>
                        </Tabs>
                        <CardContent sx={{padding: 0, overflowY: 'auto', height: 'calc(100% - 48px)'}}>
                            {activeTab === 'user' && (
                                <Menu>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                    <UserNameMenu name='나는야'/>
                                </Menu>
                            )}
                            {activeTab === 'chat' && (
                                <Menu>
                                    <UserChatMenu name="나는야" lastMessage="Your status message goes here"
                                                  lastMessageTime="1hr"/>
                                    <UserChatMenu name="나는야" lastMessage="Your status message goes here"
                                                  lastMessageTime="1hr"/>
                                </Menu>

                            )}
                            {activeTab === 'setting' && (
                                <></>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Sidebar>
    );
};