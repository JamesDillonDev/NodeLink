#!/bin/bash

# Start the Python script in the background
sudo python main.py &

# Wait for the Python script to start
sleep 10

# Navigate to the webview directory and run npm
cd webview
npm run start
