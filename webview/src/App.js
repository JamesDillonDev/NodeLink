import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, ListGroup } from 'react-bootstrap';
import './App.css';

const hostname = "node2";
const username = "James";

// Create an Axios client with a base URL for your API
const client = axios.create({
  baseURL: `http://${hostname}.local:5000/api/v1/`, // Update to your Flask API URL
});

function App() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await client.get("/messages");
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();  
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (inputValue.trim() !== "") {
      try {
        await client.post("/send", {
          message: inputValue,
          username: username,
        });
        setInputValue("");
      } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error);
      }
    }
  };

  const clearMessages = async () => {
    try {
      await client.post("/clear");
      setMessages([]);
    } catch (error) {
      console.error("Error clearing messages:", error);
    }
  };

  return (
    <Container className="chat-container" fluid>
      <Row className="header align-items-center">
        <Col>
          <h5 className="username">{username}</h5>
        </Col>
        <Col xs="auto">
          <Button variant="danger" onClick={clearMessages}>
            CLEAR
          </Button>
        </Col>
      </Row>

      <ListGroup className="messages-container">
        {messages.map((message, index) => (
          <ListGroup.Item key={index} className="message">
            <div className="timestamp">
              {new Date(message.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <strong>{message.Username}:</strong> {message.Message}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Form.Group>
        <Form.Control
          as="textarea"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={3}
          className="chat-input"
        />
      </Form.Group>
    </Container>
  );
}

export default App;
