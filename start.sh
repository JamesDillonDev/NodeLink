#!/bin/bash

# Start the Python script in the background
sudo nohup python ./app.py &

# Wait for the Python script to start
sleep 5

# Navigate to the webview directory and run npm
cd webview
sudo npm run start &
