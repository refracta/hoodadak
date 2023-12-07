import React from "react";
import {MenuItem} from "react-pro-sidebar";

export default function UserIcon({name}: {
    name: string,
}) {
    const getInitials = (name: string) => {
        const words = name.split(' ');
        const initials = words.length > 1
            ? `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`
            : words[0].charAt(0);
        return initials.toUpperCase();
    };

    const hashColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${hash % 360}, 80%, 60%)`;
    };

    return (
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${hashColor(name)} 0%, ${hashColor(name + 'salt')} 100%)`,
            boxShadow: '0 2px 2px rgba(0, 0, 0, 0.2)',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '18px',
        }}>
            {getInitials(name)}
        </div>
    );
};