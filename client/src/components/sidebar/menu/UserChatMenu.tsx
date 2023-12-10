import React, {MouseEventHandler, useEffect, useState} from "react";
import UserIconMenu from "./base/UserIconMenu";
import {User} from "../../../types/hoodadak";
import {TimeUtils} from "../../../utils/TimeUtils";

export default function UserChatMenu({user, lastMessage, lastMessageTime, active, onClick, statusColor}: {
    active?: boolean,
    lastMessage: string,
    lastMessageTime?: Date,
    onClick?: MouseEventHandler<HTMLAnchorElement>,
    statusColor?: string,
    user: User
}) {
    const [timeString, setTimeString] = useState('');

    useEffect(() => {
        const updateTimeString = () => {
            if (lastMessageTime) {
                setTimeString(TimeUtils.timeSince(lastMessageTime));
            }
        };
        updateTimeString();
        const intervalId = setInterval(updateTimeString, 1000 * 20);
        return () => {
            clearInterval(intervalId);
        };
    }, [lastMessageTime]);

    const lastMessageStyle: React.CSSProperties = {
        color: 'grey',
        fontSize: 'smaller',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    };

    return (
        <UserIconMenu user={user} onClick={onClick} active={active} statusColor={statusColor}>
            <div>
                <div style={{color: 'grey', float: 'right', fontSize: 'smaller'}}>{timeString}</div>
                <div style={{fontSize: '14px', fontWeight: 'bold'}}>{user.name}</div>
            </div>
            <div style={lastMessageStyle}>
                {lastMessage}
            </div>
        </UserIconMenu>
    );
};
