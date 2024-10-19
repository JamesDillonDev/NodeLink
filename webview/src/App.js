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
    <Container fluid className="vh-100 d-flex flex-column bg-dark text-white">
      <Row className="bg-secondary p-2 align-items-center">
        <Col>
          <h5 className="mb-0">{username}</h5>
        </Col>
        <Col xs="auto">
          <Button variant="danger" onClick={clearMessages}>
            CLEAR
          </Button>
        </Col>
      </Row>

      <Row className="flex-grow-1 overflow-auto ps-3 mt-3">
        <ListGroup className="w-100">
          {messages.map((message, index) => (
            <ListGroup.Item 
              key={index} 
              className="mb-2 border border-primary" 
              style={{ borderColor: '#001f3f', backgroundColor: '#343a40' }} // Navy blue outline
            >
              <div>
                <strong>{message.Username}:</strong> {message.Message}
              </div>
              <div className="text-light" style={{ fontSize: '0.8rem' }}> {/* Changed to text-light for visibility */}
                {new Date(message.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Control
              as="textarea"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={3}
              className="chat-input border border-primary"
              style={{ borderColor: '#001f3f' }} // Navy blue border
            />
          </Form.Group>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
