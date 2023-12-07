import React, {useEffect, useState} from 'react';
import {Menu, menuClasses, MenuItem, MenuItemStyles, Sidebar} from 'react-pro-sidebar';
import UserProfile from "./menu/UserProfile";

const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
                    ? hexToRgba('#fbfcfd', 1)
                    : 'transparent',
        }),
        button: {
            [`&.${menuClasses.disabled}`]: {
                color: '#9fb6cf',
            },
            '&:hover': {
                backgroundColor: hexToRgba('#c5e4ff', 1),
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
            backgroundColor={hexToRgba('#ffffff', 1)}
            rootStyles={{
                color: '#607489',
            }}
        >
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <div style={{flex: 1, marginBottom: '32px'}}>
                    <Menu menuItemStyles={menuItemStyles}>
                        <UserProfile profileName="나는야"
                                     lastMessage="Your status message goes heressour status message goes heressYour status message goes here"
                                     lastMessageTime="1hr"/>
                        <UserProfile profileName="꿔다놓은" lastMessage="Your status message goes here"
                                     lastMessageTime="1hr"/>
                        <UserProfile profileName="보릿자루" lastMessage="Your status message goes here"
                                     lastMessageTime="1hr"/>
                        <UserProfile profileName="가나 다라" lastMessage="Your status message goes here"
                                     lastMessageTime="1hr"/>
                        <UserProfile profileName="마바 사아" lastMessage="Your status message goes here"
                                     lastMessageTime="1hr"/>
                    </Menu>
                </div>
            </div>
        </Sidebar>
    );
};