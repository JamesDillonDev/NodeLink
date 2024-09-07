import json

#Database
import sqlite3
conn = sqlite3.connect('messages.db')
cursor = conn.cursor()

def create_database():
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
    cursor.execute('''
    INSERT INTO Messages (username, message, timestamp)
    VALUES (?, ?, ?)
    ''', (username, message, timestamp))
    conn.commit()

def display_messages():
    # Query all messages
    cursor.execute('SELECT * FROM Messages')
    data = cursor.fetchall()
    
    # Convert data to a list of dictionaries
    messages = []
    for row in data:
        message_dict = {
            "ID": row[0],
            "Username": row[1],
            "Message": row[2],
            "Timestamp": row[3]
        }
        messages.append(message_dict)
    
    # Convert the list to JSON format and print it
    json_output = json.dumps(messages, indent=4)
    return json_output

#Board Controller
import sx126x
node = sx126x.sx126x(serial_num="/dev/ttyS0", freq=868, addr=0, power=22, rssi=True, air_speed=2400, relay=False)

def send_message(message):
    print(message)
    data = bytes([255]) + bytes([255]) + bytes([18]) + bytes([255]) + bytes([255]) + bytes([12]) + message.encode()
    node.send(data)

def message_handler():
    while True:
        message = node.receive()
        if message is not None:
            add_message("UNKNOWN", message, "2024-01-01 12:30:00")

#Flask
from flask import Flask, jsonify, request
app = Flask(__name__)

@app.route('/api')
def api():
    return jsonify("NodeLink API v1.0")

@app.route('/api/messages', methods=['GET'])
def messages():
    return display_messages()

@app.route('/api/send', methods=['POST'])
def send():
    data = request.args.get('message')
    send_message(data) 
    return jsonify("Success")

#Initalise
from threading import Thread

if __name__ == '__main__':
    create_database()

    messageHandler = Thread(target=message_handler)
    messageHandler.start()

    app.run(debug=True, host='0.0.0.0', port=5000)
