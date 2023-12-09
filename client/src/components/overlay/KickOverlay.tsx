import React from "react";

export default function KickOverlay({reason}: {
    reason: string,
}) {
    return (<div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    }}>
        <p style={{fontSize: '24px', margin: '20px'}}>{reason}</p>
    </div>);
};