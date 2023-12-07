import {Button, Container, Form} from "react-bootstrap";
import logo from "../assets/logo.svg";
import React, {ChangeEvent, FormEvent, useState} from "react";
import {useIndexedDB} from "react-indexed-db-hook";
import {v4} from 'uuid';
import {User} from "../types/hoodadak";

function StartPage({setUser}: { setUser: React.Dispatch<React.SetStateAction<User | undefined>> }) {
    const [name, setName] = useState<string>('');
    const userDB = useIndexedDB('user');
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        let user: User = {name, uuid: v4()};
        await userDB.add(user);
        setUser(user);
    };
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{minHeight: "100vh"}}>
            <Form style={{width: "360px"}} onSubmit={handleSubmit}>
                <div className="text-center mb-5">
                    <img src={logo} style={{width: "175px"}} alt='logo'/>
                </div>
                <h2 className="text-center mb-2">Hoodadak</h2>
                <div className="text-center mb-4" style={{color: "#707579"}}>
                    Fast and lightweight direct messenger
                </div>

                <Form.Group className='mb-2'>
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter name" value={name}
                                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                      setName(event.target.value);
                                  }}/>
                </Form.Group>
                <Button variant="primary" type="submit" className='w-100'>Enter</Button>
            </Form>
        </Container>
    );
}

export default StartPage;
