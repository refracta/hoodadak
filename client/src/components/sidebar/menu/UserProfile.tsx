import React from "react";
import {MenuItem} from "react-pro-sidebar";

export default function UserProfile({profileName, lastMessage, lastMessageTime}: {
    profileName: string,
    lastMessage: string,
    lastMessageTime: string
}) {
    const getInitials = (name: string) => {
        const words = name.split(' ');
        const initials = words.length > 1
            ? `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`
            : words[0].charAt(0);
        return initials.toUpperCase();
    };

    const hashColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `hsl(${hash % 360}, 80%, 60%)`;
        return color;
    };

    const truncateMessage = (message: string, maxLength = 30) => {
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    return (
        <MenuItem style={{height: '60px'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '5px'}}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${hashColor(profileName)} 0%, ${hashColor(profileName + 'salt')} 100%)`,
                    boxShadow: '0 2px 2px rgba(0, 0, 0, 0.2)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '18px',
                }}>
                    {getInitials(profileName)}
                </div>
                <div style={{width: 'calc(100% - 50px)', marginLeft: '10px'}}>
                    <div>
                        <div style={{color: 'grey', fontSize: 'smaller', float: 'right'}}>{lastMessageTime}</div>
                        <div style={{fontWeight: 'bold'}}>{profileName}</div>
                    </div>
                    <div style={{
                        color: 'grey',
                        fontSize: 'smaller',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {lastMessage}
                    </div>
                </div>
            </div>
        </MenuItem>
    );
};