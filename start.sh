#!/bin/bash

# Start the Python script in the background
python3 main.py &

# Wait for the Python script to start
sleep 10

# Navigate to the webview directory and run npm
cd webview
npm run start
