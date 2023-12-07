import React from 'react';
import {Container, Navbar} from "react-bootstrap";
import {Link} from "react-router-dom";
import Aside from "../sidebar/Aside";

export default function Main({children}: { children?: React.ReactNode }) {
    const [toggled, setToggled] = React.useState<boolean>(false);

    return (
        <div style={{display: 'flex', height: '100vh', overflowY: 'hidden'}}>
            <Aside toggled={toggled} setToggled={setToggled}/>
            <main className='w-100'>
                <Navbar id="main-navbar" expand="md" variant="dark" style={{borderColor:'d2d2d2', border:'solid 1px #d2d2d2'}}>
                    <Container>
                        <Navbar.Brand>
                            <Link to='/' style={{textDecoration: 'none'}}>HOODADAK</Link>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setToggled(true)}/>
                    </Container>
                </Navbar>
                <div style={{padding: '16px 24px', color: '#44596e', overflowY: 'auto', height: '100%'}}>
                    {children}
                </div>
            </main>
        </div>
    );
};
