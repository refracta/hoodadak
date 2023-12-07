import React from "react";
import UserIconMenu from "./base/UserIconMenu";

export default function UserChatMenu({name, lastMessage, lastMessageTime}: {
    name: string,
    lastMessage: string,
    lastMessageTime: string
}) {
    return (
        <UserIconMenu name={name}>
            <div>
                <div style={{color: 'grey', fontSize: 'smaller', float: 'right'}}>{lastMessageTime}</div>
                <div style={{fontWeight: 'bold'}}>{name}</div>
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
        </UserIconMenu>
    );
};