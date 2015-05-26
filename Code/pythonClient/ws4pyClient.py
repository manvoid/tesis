from ws4py.client.threadedclient import WebSocketClient
import json
import time
import random

class SocketClient(WebSocketClient):
    def __init__(self, node, host, pushableData = [], pullableData = []):
        WebSocketClient.__init__(self, host, protocols=['http-only','chat']);
        self.node = node
        self.pushableData = pushableData
        self.pullableData = pullableData
    def opened(self):
        msg = {
            'event': 'configure',
            'type': 'node',
            'node': self.node,
            'pullableData': self.pullableData,
            'pushableData': self.pushableData
        }
        self.send(json.dumps(msg))

    def closed(self, code, reason=None):
        print "Closed down", code, reason

    def received_message(self, m):
        print m

    def publish(self, data, value = None):
        if (type(data) == str):
            # msg = "{\"event\":\"data\",\"data\":{\"" + str(data) + "\":" + str(value) +"},\"timestamp\":" + str(time.time()) + "}"
            msg = "{\"event\":\"data\",\"data\":{\"" + str(data) + "\":" + str(value) +"}}"
        elif (type(data) == dict):
            msg = "{\"event\":\"data\",\"data\":{"
            i = 1
            for key in data:
                msg += "\"" + str(key) + "\":" + str(data[key])
                if i < len(data):
                    msg += ","
                i = i+1
            # msg += "},\"timestamp\":" + str(time.time()) + "}"
            msg += "}}"
        self.send(msg)

if __name__ == '__main__':
    host = 'ws://localhost:9000'

    client1 = SocketClient('pythonSocket', host, ['encoder1','encoder2'], ['control1'])
    client2 = SocketClient('pythonSocket2', host, ['encoder3','encoder4'], ['control2'])
    client1.connect()
    client2.connect()

    # for i in range(20):
    #     client = PublisherClient("P:" + str(i), host)
    #     client.connect()
    #     publishers.append(client)

    while True:
        # msg = "{\"event\":\"data\",\"encoder1\":" + str(random.random()) + ",\"timestamp\":" + str(time.time()) + "}"
        client1.publish({"encoder1": random.random(), "encoder2": 10})
        client2.publish('encoder3', 11)
        time.sleep(2)
            
    # try:
    #     wss = SubscriberClient('wssss', host)
    #     wss.connect()
    #     wsp.connect()
    #     time.sleep(2)
    #     wsp.publish(123213)
    #     wss.run_forever()
    # except KeyboardInterrupt:
    #     ws.close()
