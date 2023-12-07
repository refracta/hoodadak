import React from "react";
import UserIconMenu from "./base/UserIconMenu";

export default function UserNameMenu({name}: {
    name: string
}) {
    return (
        <UserIconMenu name={name}>
            <div style={{fontWeight: 'bold', fontSize: '14px'}}>{name}</div>
        </UserIconMenu>
    );
};