import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Create an Axios client with a base URL for your API
const client = axios.create({
  baseURL: "http://node2.local:5000/api/v1/", // Update to your Flask API URL
});

function App() {
  // State to store the input value
  const [inputValue, setInputValue] = useState("");
  // State to store the list of messages
  const [messages, setMessages] = useState([]);

  // Fetch messages on component mount and periodically every 3 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await client.get("/messages");
        // Set the received messages to the state
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Fetch messages initially and set up interval for periodic updates
    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle key press (Enter to send, Shift + Enter for a new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();  // Prevent the default behavior of Enter
      sendMessage();
    }
  };

  // Send the message to the server
  const sendMessage = async () => {
    if (inputValue.trim() !== "") {
      try {
        const response = await client.post("/send", null, {
          params: { message: inputValue } // Sending message as a query parameter
        });
        // Clear the input field after sending the message
        setInputValue("");
        // Optionally, fetch messages again to update the message list after sending
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // Clear all messages from the server
  const clearMessages = async () => {
    try {
      await client.post("/clear");
      // Clear the messages from state after clearing them on the server
      setMessages([]);
    } catch (error) {
      console.error("Error clearing messages:", error);
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

      {/* Button to clear messages */}
      <button onClick={clearMessages} className="clear-button">
        Clear Messages
      </button>
    </div>
  );
}

export default App;