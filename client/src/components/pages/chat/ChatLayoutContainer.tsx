import React from "react";
import {useMediaQuery, useTheme} from "@mui/material";
import background from "../../../assets/background.svg";

export default function ChatLayoutContainer({children}: { children?: React.ReactNode }) {
    const defaultTheme = useTheme();
    const isSmUp = useMediaQuery(defaultTheme.breakpoints.up('sm'));
    const outerWrapperStyle: React.CSSProperties = {
        backgroundColor: '#ffffff',
        backgroundImage: `url(${background})`,
        color: '#44596e',
        height: isSmUp ? 'calc(100% - 64px)' : 'calc(100% - 56px)',
        margin: 0,
        overflowY: 'auto',
        padding: 0,
        width: '100%'
    };
    const innerWrapperStyle: React.CSSProperties = {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    };
    return (
        <div style={outerWrapperStyle} className='topography-pattern'>
            <div style={innerWrapperStyle}>
                {children}
            </div>
        </div>
    );
}
