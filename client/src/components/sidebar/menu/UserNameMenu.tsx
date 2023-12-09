import React, {MouseEventHandler} from "react";
import UserIconMenu from "./base/UserIconMenu";
import {User} from "../../../types/hoodadak";

export default function UserNameMenu({user, onClick, statusColor}: {
    user: User,
    onClick?: MouseEventHandler<HTMLAnchorElement>,
    statusColor?: string
}) {
    return (
        <UserIconMenu user={user} onClick={onClick} statusColor={statusColor}>
            <div style={{fontWeight: 'bold', fontSize: '14px'}}>{user.name}</div>
        </UserIconMenu>
    );
};