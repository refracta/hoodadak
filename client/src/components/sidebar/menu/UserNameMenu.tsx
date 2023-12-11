import React, {MouseEventHandler} from "react";
import UserIconMenu from "./base/UserIconMenu";
import {User} from "../../../types/hoodadak";

export default function UserNameMenu({user, onClick, statusColor}: {
    onClick?: MouseEventHandler<HTMLAnchorElement>,
    statusColor?: string,
    user: User
}) {
    return (
        <UserIconMenu user={user} onClick={onClick} statusColor={statusColor}>
            <div style={{fontSize: '14px', fontWeight: 'bold'}}>{user.name}</div>
        </UserIconMenu>
    );
};