import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State to store the input value
  const [inputValue, setInputValue] = useState("");
  // State to store the list of messages
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch messages when the component mounts
    fetchMessages();
  }, []);

  // Fetch messages from the backend
  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/messages');
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

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

  // Send the message to the backend
  const sendMessage = async () => {
    if (inputValue.trim() !== "") {
      try {
        await axios.post('http://localhost:5000/api/send', null, {
          params: { message: inputValue }
        });
        setInputValue("");  // Clear the input field
        fetchMessages();  // Refresh the message list
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
          <div key={index} className="message">{message.Message}</div>
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
