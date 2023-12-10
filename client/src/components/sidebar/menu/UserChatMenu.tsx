import React, {MouseEventHandler} from "react";
import UserIconMenu from "./base/UserIconMenu";
import {User} from "../../../types/hoodadak";

export default function UserChatMenu({user, lastMessage, lastMessageTime, active, onClick, statusColor}: {
    active?: boolean,
    lastMessage: string,
    lastMessageTime: string,
    onClick?: MouseEventHandler<HTMLAnchorElement>,
    statusColor?: string,
    user: User
}) {
    const lastMessageStyle: React.CSSProperties = {
        color: 'grey',
        fontSize: 'smaller',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    }
    return (
        <UserIconMenu user={user} onClick={onClick} active={active} statusColor={statusColor}>
            <div>
                <div style={{color: 'grey', float: 'right', fontSize: 'smaller'}}>{lastMessageTime}</div>
                <div style={{fontSize: '14px', fontWeight: 'bold'}}>{user.name}</div>
            </div>
            <div style={lastMessageStyle}>
                {lastMessage}
            </div>
        </UserIconMenu>
    );
};