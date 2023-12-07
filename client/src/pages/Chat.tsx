import React, {FormEvent, useState} from 'react';
import {Container, Row, Col, Form, Button, Card} from 'react-bootstrap';

function Chat() {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState<string>('');

    const sendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (input) {
            setMessages([...messages, input]);
            setInput('');
        }
    };

    return (
        <Container>
            <Row>
                <Col md={8} className="offset-md-2">
                    <Card>
                        <Card.Body>
                            {messages.map((message, index) => (
                                <div key={index}>{message}</div>
                            ))}
                        </Card.Body>
                    </Card>
                    <Form onSubmit={sendMessage}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Send
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Chat;
