import json
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from threading import Thread, Lock, Event
import sx126x
import time
from queue import Queue

# Initialize Flask app
app = Flask(__name__)

# Database functions
def get_db_connection():
    conn = sqlite3.connect('messages.db')
    conn.row_factory = sqlite3.Row
    return conn

def create_database():
    with get_db_connection() as conn:
        conn.execute('''
        CREATE TABLE IF NOT EXISTS Messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        conn.commit()

def add_message(username, message, timestamp):
    with get_db_connection() as conn:
        conn.execute('''
        INSERT INTO Messages (username, message, timestamp)
        VALUES (?, ?, ?)
        ''', (username, message, timestamp))
        conn.commit()

def display_messages():
    with get_db_connection() as conn:
        cursor = conn.execute('SELECT * FROM Messages')
        messages = [
            {
                "ID": row['id'],
                "Username": row['username'],
                "Message": row['message'],
                "Timestamp": row['timestamp']
            }
            for row in cursor.fetchall()
        ]
        return json.dumps(messages, indent=4)

def clear_messages():
    with get_db_connection() as conn:
        conn.execute('DELETE FROM Messages')
        conn.commit()

# Board Controller
node = sx126x.sx126x(serial_num="/dev/ttyS0", freq=868, addr=0, power=22, rssi=True, air_speed=2400, relay=False)

# Message sending queue and lock
message_queue = Queue()
queue_lock = Lock()

def send_message(message):
    data = bytes([255, 255, 18, 255, 255, 12]) + message.encode()
    node.send(data)

def message_handler():
    while True:
        if not message_queue.empty():
            with queue_lock:
                message_data = message_queue.get()
                send_message(message_data)
        time.sleep(0.1)  # Prevent tight looping

def add_to_queue(message):
    with queue_lock:
        message_queue.put(message)

def message_receiver():
    while True:
        message = node.receive()
        if message:
            data = None
            try:
                data = message.decode("utf-8")
                # Parse the JSON payload
                payload = json.loads(data)
                username = payload.get("username", "UNKNOWN")
                message_text = payload.get("message", "")
                timestamp = payload.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

                # Add the message to the database if not already added
                if "confirmation" in payload:
                    # Here we expect a confirmation with timestamp
                    confirmation_timestamp = payload["timestamp"]
                    print(f"Message received confirmation for timestamp: {confirmation_timestamp}")
                else:
                    # Add the message to the database
                    add_message(username, message_text, timestamp)

            except (UnicodeDecodeError, json.JSONDecodeError):
                print("Decode or JSON Error")

def send_with_confirmation(message, retries=3, timeout=10):
    for attempt in range(retries):
        event = Event()  # Create an Event to wait for confirmation
        add_to_queue(message)

        # Wait for confirmation with a timeout
        if not event.wait(timeout):
            print(f"Confirmation not received, retrying {attempt + 1}/{retries}...")
            continue  # Retry sending the message

        print("Confirmation received, message recorded in database.")
        return True  # Confirmation received

    print("Failed to receive confirmation after multiple attempts.")
    return False  # Failed to confirm

@app.route('/api/v1/send', methods=['POST'])
def send():
    # Retrieve JSON payload
    data = request.get_json()
    
    # Extract message and username from JSON payload
    message = data.get('message')
    username = data.get('username', 'UNKNOWN')  # Default to 'UNKNOWN' if not provided
    
    if not message:
        return jsonify({"status": "Error", "message": "No message provided"}), 400
    
    # Get the current timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Prepare JSON payload for LoRa
    payload = {
        "username": username,
        "message": message,
        "timestamp": timestamp
    }

    # Attempt to send the message with confirmation
    if send_with_confirmation(json.dumps(payload)):
        return jsonify({
            "status": "Message Sent",
            "username": username,
            "message": message,
            "timestamp": timestamp
        })
    else:
        return jsonify({
            "status": "Error",
            "message": "Failed to send message after multiple attempts."
        }), 500

@app.route('/api/v1/clear', methods=['POST'])
def clear():
    clear_messages()
    return jsonify("Messages cleared")

@app.route('/api/v1/swagger')
def swagger():
    return send_from_directory('.', 'index.html')

# Initialize
if __name__ == '__main__':
    create_database()
    Thread(target=message_handler, daemon=True).start()
    Thread(target=message_receiver, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, debug=True)
