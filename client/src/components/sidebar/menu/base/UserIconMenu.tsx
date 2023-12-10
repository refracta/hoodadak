import React, {MouseEventHandler} from "react";
import {MenuItem} from "react-pro-sidebar";
import UserIcon from "../../../icons/UserIcon";
import {User} from "../../../../types/hoodadak";

export default function UserIconMenu({user, children, onClick, active, statusColor}: {
    active?: boolean,
    children?: React.ReactNode,
    onClick?: MouseEventHandler<HTMLAnchorElement>,
    statusColor?: string,
    user: User
}) {
    return (
        <MenuItem style={{height: '60px'}} onClick={onClick} active={active}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '5px'}}>
                <UserIcon user={user} statusColor={statusColor}/>
                <div style={{width: 'calc(100% - 50px)', marginLeft: '10px'}}>
                    {children}
                </div>
            </div>
        </MenuItem>
    );
};