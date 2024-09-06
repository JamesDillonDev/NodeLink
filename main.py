import sys
import sx126x
from threading import Thread
from flask import Flask, jsonify, request
import json

node = sx126x.sx126x(serial_num="/dev/ttyS0", freq=868, addr=0, power=22, rssi=True, air_speed=2400, relay=False)

def send_message(message):
    data = bytes([255]) + bytes([255]) + bytes([18]) + bytes([255]) + bytes([255]) + bytes([12]) + message.encode()
    node.send(data)

def message_handler():
    while True:
        message = node.receive()        
        if message is not None:
            message_to_append = {'payload': message}
            with open('messages.json', 'r') as file:
                data = json.load(file)
                data.append(message_to_append)

            with open('messages.json', 'w') as file:
                json.dump(data, file, indent=4)
                
app = Flask(__name__)

@app.route('/api')
def api():
    return jsonify("NodeLink API v1.0")

@app.route('/api/messages', methods=['GET'])
def messages():
    with open('messages.json', 'r') as file:
        return json.load(file)

@app.route('/api/send', methods=['POST'])
def send():
    data = request.args.get('message')
    send_message(data) 
    return jsonify("Success")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)