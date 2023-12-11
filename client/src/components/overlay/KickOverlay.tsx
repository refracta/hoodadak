import React from "react";

export default function KickOverlay({reason}: {
    reason: string,
}) {
    const overlayStyle: React.CSSProperties = {
        display: 'flex',
        position: 'fixed',
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
    };
    const reasonStyle: React.CSSProperties = {fontSize: '24px', margin: '20px'};

    return (
        <div style={overlayStyle}>
            <p style={reasonStyle}>{reason}</p>
        </div>
    );
};