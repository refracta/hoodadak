import React from 'react';
import {AppBar, Box, Container, IconButton, Toolbar, Typography} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {Link} from "react-router-dom";
import Aside from "../sidebar/Aside";

export default function Main({children}: { children?: React.ReactNode }) {
    const [toggled, setToggled] = React.useState<boolean>(false);

    return (
        <Box sx={{display: 'flex', height: '100vh', overflowY: 'hidden'}}>
            <Aside toggled={toggled} setToggled={setToggled}/>
            <Box component="main" sx={{flexGrow: 1, width: '100%'}}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            <Link to="/" style={{textDecoration: 'none', color: 'inherit'}}>HOODADAK</Link>
                        </Typography>
                        <IconButton
                            edge="end"
                            color="inherit"
                            aria-label="menu"
                            onClick={() => setToggled(true)}
                        >
                            <MenuIcon/>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Container sx={{py: 2, color: '#44596e', overflowY: 'auto', height: '100%'}}>
                    {children}
                </Container>
            </Box>
        </Box>
    );
};
