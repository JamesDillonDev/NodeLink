#!/bin/bash

# Start the Python script in the background
python3 main.py &

# Capture the process ID of the Python script
python_pid=$!

# Function to run npm after waiting for the Python script to start
wait_for_python() {
  sleep 10
  cd webview
  npm run start
}

# Run the wait_for_python function in the background
wait_for_python &

# Optionally wait for the Python script to finish (if needed)
wait $python_pid
