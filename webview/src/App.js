import React, {useState} from 'react';
import './App.css';

function App() {
  // State to store the input value
  const [inputValue, setInputValue] = useState("");
  // State to store the list of messages
  const [messages, setMessages] = useState([]);

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
  const sendMessage = () => {
    if (inputValue.trim() !== "") {
      setMessages([...messages, inputValue]);  // Add the new message to the message list
      setInputValue("");  // Clear the input field
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {/* Render chat messages */}
        {messages.map((message, index) => (
          <div key={index} className="message">{message}</div>
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