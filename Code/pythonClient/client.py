import websocket
from websocket import create_connection
import json
import time
import random

def on_message(ws, message):
    print(message)

def on_open(ws):
    def run(*args):
        msg = {
            'event': 'configuration',
            'type': 'subscriber',
            'node': 'wsSubscriber',
        }
        ws.send(json.dumps(msg))
        ws.close()
        print ("thread terminating...")
    thread.start_new_thread(run, ())

# websocket.enableTrace(True)

ws1 = create_connection('ws://localhost:9000')
ws2 = create_connection('ws://localhost:9000')
ws3 = create_connection('ws://localhost:9000')
wsSubscriber = websocket.WebSocketApp('ws://localhost:9000',
                                      on_message = on_message)

wsSubscriber.on_open = on_open

msg = {
    'event': 'configuration',
    'type': 'publisher',
    'node': 'python1',
}

# wsSubscriber.run_forever()

# clients = []

# for x in range(200):
#     clients.append(create_connection('ws://localhost:9000'))

# name = 0
# for client in clients:
#     msg = {
#         'event': 'configuration',
#         'type': 'publisher',
#         'name': 'python1',
#         'topic': str(name)
#     }
#     msg_string = json.dumps(msg)
#     name = name + 1
#     client.send(msg_string)
#     # time.sleep(0.1)

# while True:
#     for client in clients:
#         msg = {'data':random.random(),'timestamp':time.time()}
#         client.send(json.dumps(msg))
#     time.sleep(0.1)
 

ws1.send(json.dumps(msg))
msg['node'] = 'motor1'
ws2.send(json.dumps(msg))
msg['node'] = 'motor2'
msg['type'] = 'subscriber'
ws3.send(json.dumps(msg))
msg['node'] = 'nodesubscriber'
msg['type'] = 'subscriber'
# wsSubscriber.send(json.dumps(msg))
time.sleep(2)

while True:
    msg1 = {'data':random.random(),'timestamp':time.time()}
    msg2 = {'data':random.random(),'timestamp':time.time()}
    # msg3 = {'data':random.random(),'timestamp':time.time()}
    ws1.send(json.dumps(msg1))
    ws2.send(json.dumps(msg2))
    # ws3.send(json.dumps(msg3))
    time.sleep(0.1)

ws.close()
