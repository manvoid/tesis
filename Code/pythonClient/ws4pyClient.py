from ws4py.client.threadedclient import WebSocketClient
import json
import time
import random

class SubscriberClient(WebSocketClient):
    def __init__(self, node, host):
        WebSocketClient.__init__(self, host, protocols=['http-only','chat']);
        self.node = node
    def opened(self):
        msg = {
            'event': 'configuration',
            'type': 'subscriber',
            'node': self.node
        }
        self.send(json.dumps(msg))

    def closed(self, code, reason=None):
        print "Closed down", code, reason

    def received_message(self, m):
        print m

class PublisherClient(WebSocketClient):
    def __init__(self, node, host):
        WebSocketClient.__init__(self, host, protocols=['http-only','chat']);
        self.node = node
    def opened(self):
        msg = {
            'event': 'configuration',
            'type': 'publisher',
            'node': self.node
        }
        self.send(json.dumps(msg))

    def closed(self, code, reason=None):
        print "Closed down", code, reason

    def received_message(self, m):
        print m

    def publish(self, data):
        msg = "{\"event\":\"data\",\"data\":" + str(data) + ",\"timestamp\":" + str(time.time()) + "}"
        self.send(msg)

if __name__ == '__main__':
    host = 'ws://localhost:9000'
    subscribers = []
    publishers = []

    subscribers.append(SubscriberClient("subscriber", host))
    subscribers[0].connect()

    for i in range(20):
        client = PublisherClient("P:" + str(i), host)
        client.connect()
        publishers.append(client)

    while True:
        for client in publishers:
            client.publish(random.random())
        time.sleep(0.1)
            
    # try:
    #     wss = SubscriberClient('wssss', host)
    #     wss.connect()
    #     wsp.connect()
    #     time.sleep(2)
    #     wsp.publish(123213)
    #     wss.run_forever()
    # except KeyboardInterrupt:
    #     ws.close()
