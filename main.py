import json
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request
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
        cursor = conn.cursor()
        cursor.execute('''
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
        cursor = conn.cursor()
        cursor.execute('''
        INSERT INTO Messages (username, message, timestamp)
        VALUES (?, ?, ?)
        ''', (username, message, timestamp))
        conn.commit()

def display_messages():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM Messages')
        data = cursor.fetchall()
        
        messages = []
        for row in data:
            message_dict = {
                "ID": row['id'],
                "Username": row['username'],
                "Message": row['message'],
                "Timestamp": row['timestamp']
            }
            messages.append(message_dict)
        
        return json.dumps(messages, indent=4)

# Board Controller
node = sx126x.sx126x(serial_num="/dev/ttyS0", freq=868, addr=0, power=22, rssi=True, air_speed=2400, relay=False)

def send_message(message):
    print(message)
    data = bytes([255]) + bytes([255]) + bytes([18]) + bytes([255]) + bytes([255]) + bytes([12]) + message.encode()
    node.send(data)

def message_handler():
    while True:
        message = node.receive()
        if message is not None:
            add_message("UNKNOWN", message, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

# Flask routes
@app.route('/api')
def api():
    return jsonify("NodeLink API v1.0")

@app.route('/api/messages', methods=['GET'])
def messages():
    return display_messages()

@app.route('/api/send', methods=['POST'])
def send():
    data = request.json.get('message')
    send_message(data) 
    return jsonify("Success")

# Initialize
if __name__ == '__main__':
    create_database()
    messageHandler = Thread(target=message_handler)
    messageHandler.start()
    app.run(debug=True, host='0.0.0.0', port=5000)
