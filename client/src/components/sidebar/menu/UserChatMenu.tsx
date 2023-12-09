import React, {MouseEventHandler} from "react";
import UserIconMenu from "./base/UserIconMenu";
import {User} from "../../../types/hoodadak";

export default function UserChatMenu({user, lastMessage, lastMessageTime, active, onClick, statusColor}: {
    user: User,
    lastMessage: string,
    lastMessageTime: string,
    active?: boolean,
    statusColor?: string,
    onClick?: MouseEventHandler<HTMLAnchorElement>
}) {
    return (
        <UserIconMenu user={user} onClick={onClick} active={active} statusColor={statusColor}>
            <div>
                <div style={{color: 'grey', fontSize: 'smaller', float: 'right'}}>{lastMessageTime}</div>
                <div style={{fontWeight: 'bold', fontSize: '14px'}}>{user.name}</div>
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