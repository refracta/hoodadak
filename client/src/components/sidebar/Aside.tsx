import React, {useEffect, useState} from 'react';
import {Menu, menuClasses, MenuItem, MenuItemStyles, Sidebar} from 'react-pro-sidebar';
import UserChatMenu from "./menu/UserChatMenu";
import {Button, Card, Nav, Tab} from "react-bootstrap";
import UserNameMenu from "./menu/UserNameMenu";

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
    const [broken, setBroken] = React.useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

    const handleResize = () => {
        setWindowWidth(window.innerWidth);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const menuItemStyles: MenuItemStyles = {
        root: {
            fontSize: '13px',
            fontWeight: 400,
        },
        icon: {
            color: '#0098e5',
            [`&.${menuClasses.disabled}`]: {
                color: '#9fb6cf',
            },
        },
        SubMenuExpandIcon: {
            color: '#b6b7b9',
        },
        subMenuContent: ({level}) => ({
            backgroundColor:
                level === 0
                    ? '#fbfcfd'
                    : 'transparent',
        }),
        button: {
            [`&.${menuClasses.disabled}`]: {
                color: '#9fb6cf',
            },
            '&:hover': {
                backgroundColor: '#c5e4ff',
                color: '#44596e',
            },
        },
        label: ({open}) => ({
            fontWeight: open ? 600 : undefined,
        }),
    };

    return (
        <Sidebar
            width={getSideBarWidth(windowWidth)}
            toggled={toggled}
            onBackdropClick={() => setToggled(false)}
            onBreakPoint={setBroken}
            breakPoint="md"
            backgroundColor='#ffffff'
            rootStyles={{
                color: '#607489',
            }}
        >
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <div style={{flex: 1, overflowY: 'hidden'}}>
                    <Tab.Container defaultActiveKey="user">
                        <Card style={{height: '100%', borderRadius: 0}}>
                            <Card.Header>
                                <Nav variant="tabs" className="column">
                                    <Nav.Item>
                                        <Nav.Link eventKey="user">User</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="chat">Chat</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="setting">Setting</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Header>
                            <Card.Body style={{padding: 0, overflowY: 'auto'}}>
                                <Tab.Content>
                                    <Tab.Pane eventKey="user">
                                        <Menu menuItemStyles={menuItemStyles}>
                                            <UserNameMenu name='나는야'/>
                                            <UserNameMenu name='꿔다놓은'/>
                                            <UserNameMenu name='보릿자루'/>
                                            <UserNameMenu name='hello world'/>
                                            <UserNameMenu name='hello world'/>
                                        </Menu>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="chat">
                                        <Menu menuItemStyles={menuItemStyles}>
                                            <UserChatMenu name="나는야"
                                                          lastMessage="Your status message goes heressour status message goes heressYour status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="꿔다놓은" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="보릿자루" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="가나 다라" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="마바 사아" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/> <UserChatMenu name="나는야"
                                                                                                lastMessage="Your status message goes heressour status message goes heressYour status message goes here"
                                                                                                lastMessageTime="1hr"/>
                                            <UserChatMenu name="꿔다놓은" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="보릿자루" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="가나 다라" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="마바 사아" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/> <UserChatMenu name="나는야"
                                                                                                lastMessage="Your status message goes heressour status message goes heressYour status message goes here"
                                                                                                lastMessageTime="1hr"/>
                                            <UserChatMenu name="꿔다놓은" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="보릿자루" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="가나 다라" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="마바 사아" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/> <UserChatMenu name="나는야"
                                                                                                lastMessage="Your status message goes heressour status message goes heressYour status message goes here"
                                                                                                lastMessageTime="1hr"/>
                                            <UserChatMenu name="꿔다놓은" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="보릿자루" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="가나 다라" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="마바 사아" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/> <UserChatMenu name="나는야"
                                                                                                lastMessage="Your status message goes heressour status message goes heressYour status message goes here"
                                                                                                lastMessageTime="1hr"/>
                                            <UserChatMenu name="꿔다놓은" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="보릿자루" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="가나 다라" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                            <UserChatMenu name="마바 사아" lastMessage="Your status message goes here"
                                                          lastMessageTime="1hr"/>
                                        </Menu>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="setting">
                                    </Tab.Pane>
                                </Tab.Content>
                            </Card.Body>
                        </Card>
                    </Tab.Container>
                </div>
            </div>
        </Sidebar>
    );
};