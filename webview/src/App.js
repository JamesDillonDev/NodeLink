import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
        }); // Send as JSON payload
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
    <div className="chat-container">
      <div className="header">
        <div className="username">{username}</div>
        <button onClick={clearMessages} className="btn btn-primary clear-button">
          CLEAR
        </button>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <div className="timestamp">{new Date(message.Timestamp).toLocaleTimeString()}</div>
            <strong>{message.Username}:</strong> {message.Message}
          </div>
        ))}
      </div>

      <textarea
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="chat-input"
      />
    </div>
  );
}

export default App;
