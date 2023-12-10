import React from "react";
import {User} from "../../types/hoodadak";

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

export default function UserIcon({user, statusColor}: {
    user: User,
    statusColor?: string
}) {
    const iconStyle: React.CSSProperties = {
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '20px',
        color: 'white',
        boxShadow: '0 2px 2px rgba(0, 0, 0, 0.2)',
        background: `linear-gradient(135deg, ${hashColor(user.hash!)} 0%, ${hashColor(user.hash + 'salt')} 100%)`,
        fontSize: '18px',
    };

    const statusStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '0px',
        right: '0px',
        width: '10px',
        height: '10px',
        borderRadius: '10px',
        border: 'groove 2px white',
        backgroundColor: statusColor,
    }

    return (
        <div style={iconStyle}>
            {getInitials(user.name)}
            {statusColor && <div style={statusStyle}/>}
        </div>
    );
};