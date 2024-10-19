import json
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from threading import Thread
import sx126x

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

def send_message(message):
    data = bytes([255, 255, 18, 255, 255, 12]) + message.encode()
    node.send(data)

def message_handler():
    while True:
        message = node.receive()
        if message:
            data = None
            try:
                data = message.decode("utf-8")
            except UnicodeDecodeError:
                print("Decode Error")
            if data != None:
                add_message("UNKNOWN", data, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

# Flask routes
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.route('/api/v1')
def api():
    return jsonify("NodeLink API v1.1")

@app.route('/api/v1/messages', methods=['GET'])
def messages():
    return display_messages()

@app.route('/api/v1/send', methods=['POST'])
def send():
    # Retrieve message and username from request arguments
    data = request.args.get('message')
    username = request.args.get('username', 'UNKNOWN')  # Default to 'UNKNOWN' if not provided
    
    # Get the current timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Send the message over the LoRa node
    send_message(data)
    
    # Add the message to the database
    add_message("You", data, timestamp)

    return jsonify({
        "status": "Message Sent",
        "username": username,
        "message": data,
        "timestamp": timestamp
    })

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
    app.run(host='0.0.0.0', port=5000, debug=True)
