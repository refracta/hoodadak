import React, {MouseEventHandler} from "react";
import UserIconMenu from "./base/UserIconMenu";
import {User} from "../../../types/hoodadak";

export default function UserNameMenu({user, onClick}: {
    user: User,
    onClick?: MouseEventHandler<HTMLAnchorElement>
}) {
    return (
        <UserIconMenu user={user} onClick={onClick}>
            <div style={{fontWeight: 'bold', fontSize: '14px'}}>{user.name}</div>
        </UserIconMenu>
    );
};