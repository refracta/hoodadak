import React, {ChangeEvent, FormEvent, useContext, useState} from "react";
import {v4} from 'uuid';
import {useIndexedDB} from "react-indexed-db-hook";
import {Box, Button, Container, TextField, Typography} from "@mui/material";
import {User} from "../../types/hoodadak";
import CryptoJS from 'crypto-js';
import {GlobalContext} from "../../App";

export default function StartPage() {
    const {userDB, setUser} = useContext(GlobalContext);
    const [name, setName] = useState<string>('');

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        let uuid = v4();
        let user = {
            name, uuid, hash: CryptoJS.SHA512(name + uuid).toString()
        };
        await userDB.add(user);
        setUser(user);
    };

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
    };

    const NameTextField = () => (
        <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
        />
    );

    const EnterButton = () => (
        <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{mt: 3, mb: 2}}
        >
            Enter
        </Button>
    );

    return (
        <Container maxWidth="xs" style={containerStyle}>
            <Box component="form" onSubmit={handleSubmit} sx={{mt: 1}}>
                <Box style={{textAlign: 'center', marginBottom: '3rem'}}>
                    <img src='logo.svg' style={{width: "175px"}} alt='logo'/>
                </Box>
                <Typography component="h1" variant="h5" style={{textAlign: 'center', marginBottom: '0.5rem'}}>
                    Hoodadak
                </Typography>
                <Typography variant="body2" style={{textAlign: 'center', marginBottom: '1rem', color: "#707579"}}>
                    Fast and lightweight direct messenger
                </Typography>
                <NameTextField/>
                <EnterButton/>
            </Box>
        </Container>
    );
}
