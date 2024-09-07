import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const client = axios.create({
  baseURL: "http://node2.local:5000/api",
});

function App() {
  // State to store the input value
  const [inputValue, setInputValue] = useState("");
  // State to store the list of messages
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await client.get("/messages");
        // Set the messages in state
        setMessages(JSON.parse(response.data));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Fetch messages initially and set up interval for periodic updates
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle key press (Enter to send, Shift + Enter for a new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();  // Prevents default behavior of Enter
      sendMessage();
    }
  };

  // Send the message
  const sendMessage = async () => {
    if (inputValue.trim() !== "") {
      try {
        await client.post("/send", null, { params: { message: inputValue } });
        setInputValue("");  // Clear the input field
        // Optionally refresh messages after sending
        const response = await client.get("/messages");
        setMessages(JSON.parse(response.data));
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {/* Render chat messages */}
        {messages.map((message, index) => (
          <div key={index} className="message">
            <strong>{message.Username}:</strong> {message.Message}
          </div>
        ))}
      </div>

      {/* Chat Input Box */}
      <textarea
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}  // Capture Enter key press
        placeholder="Type a message..."
        className="chat-input"
      />
    </div>
  );
}

export default App;
