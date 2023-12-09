import React, {ChangeEvent, FormEvent, useState} from "react";
import {v4} from 'uuid';
import {useIndexedDB} from "react-indexed-db-hook";
import {Box, Button, Container, TextField, Typography} from "@mui/material";
import logo from "../assets/logo.svg";
import {User} from "../types/hoodadak";
import CryptoJS from 'crypto-js';

function StartPage({setUser}: { setUser: React.Dispatch<React.SetStateAction<User | undefined>> }) {
    const [name, setName] = useState<string>('');
    const userDB = useIndexedDB('user');

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        let uuid = v4();
        let user = {
            name, uuid, hash: CryptoJS.SHA512(name + uuid).toString()
        };
        await userDB.add(user);
        setUser(user);
    };

    return (
        <Container maxWidth="xs" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh'
        }}>
            <Box component="form" onSubmit={handleSubmit} sx={{mt: 1}}>
                <Box style={{textAlign: 'center', marginBottom: '3rem'}}>
                    <img src={logo} style={{width: "175px"}} alt='logo'/>
                </Box>
                <Typography component="h1" variant="h5" style={{textAlign: 'center', marginBottom: '0.5rem'}}>
                    Hoodadak
                </Typography>
                <Typography variant="body2" style={{textAlign: 'center', marginBottom: '1rem', color: "#707579"}}>
                    Fast and lightweight direct messenger
                </Typography>

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

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{mt: 3, mb: 2}}
                >
                    Enter
                </Button>
            </Box>
        </Container>
    );
}

export default StartPage;
