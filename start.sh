#!/bin/bash

# Start the Python script in the background
python3 ~/Projects/NodeLink/main.py

# Wait for the Python script to start
sleep 10

# Navigate to the webview directory and run npm
cd ~/Projects/NodeLink/webview
npm run start
