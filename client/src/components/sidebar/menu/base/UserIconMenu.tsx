import React from "react";
import {MenuItem} from "react-pro-sidebar";
import UserIcon from "../../../icons/UserIcon";

export default function UserIconMenu({name, children}: { name: string, children?: React.ReactNode }) {
    return (
        <MenuItem style={{height: '60px'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '5px'}}>
                <UserIcon name={name}/>
                <div style={{width: 'calc(100% - 50px)', marginLeft: '10px'}}>
                    {children}
                </div>
            </div>
        </MenuItem>
    );
};