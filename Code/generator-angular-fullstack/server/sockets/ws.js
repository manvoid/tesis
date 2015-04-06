module.exports = function (wss) {
  'use strict';

  var frontends = [];
  var subscribers = [];
  var publishers = [];
  var topics = {};

  var getTopics = function () {
    var topics_mapped = {};
    for (var key in topics) {
      topics_mapped[key] = {}
      topics_mapped[key].subscribers = [];
      topics_mapped[key].publishers = [];
      for (var subscriber in topics[key].subscribers) {
        topics_mapped[key].subscribers.push(topics[key].subscribers[subscriber].name);
      }
      for (var publisher in topics[key].publishers) {
        topics_mapped[key].publishers.push(topics[key].publishers[publisher].name);
      }
    }
    return topics_mapped;
  };

  var updateTopics = function () {
    var topics_mapped = getTopics();
    var msg = JSON.stringify({event: 'topics', topics: topics_mapped});
    for (var key in frontends) {
      frontends[key].send(msg);
    }
  };

  var configure = function (configuration, ws, error) {

    if (ws.type !== undefined) {
      console.log('Ya se tenía asignado un tipo');
      console.log('Procediendo a desconectar');
      ws.close();
      return;
    }

    if (configuration.event === 'configuration') {
      switch(configuration.type) {
      case 'frontend':
        ws.type = 'frontend';
        ws.name = configuration.name;
        ws.subscribedTo = [];
        frontends.push(ws);
        console.log('se agregó un nuevo frontend');
        break;
      case 'subscriber':
        ws.type = 'subscriber';
        ws.name = configuration.name;
        ws.topic = configuration.topic;
        for (var key in frontends) {
          frontends[key].send()
        }
        updateTopics();
        break;
      case 'publisher':
        ws.type = 'publisher';
        ws.name = configuration.name;
        ws.topic = configuration.topic;
        // publishers.push(ws);
        if(topics[configuration.topic] === undefined)
          topics[configuration.topic] = {publishers: [], subscribers: [], type: 'none'}
        topics[configuration.topic].publishers.push(ws);
        console.log('Se agregó un nuevo publisher');
        updateTopics();
        break;
      default:
        error();
      }
    } else {
      error();
    }
  };

  wss.on('connection', function connection(ws) {
    console.log('Se conectó un socket nuevo');

    ws.on('message', function incoming(message) {
      // console.log('received: %s', message);

      if (ws.type !== 'video')
        var message = JSON.parse(message);

      // Commands that the frontend can send to the server
      if (ws.type === 'frontend') {
        switch(message.event) {
        case 'getSockets':
          console.log('la lista de sockets es: ');
          var sockets_list = [];
          wss.clients.forEach(function each(client) {
            console.log(client.type);
            sockets_list.push(client.type);
          });
          ws.send(JSON.stringify({sockets_list: sockets_list}))
          break;
        case 'getTopics':
          //console.log('Se solicitó la lista de temas');
          console.log(topics);
          var topics_mapped = {};
          for (var key in topics) {
            topics_mapped[key] = {}
            topics_mapped[key].subscribers = [];
            topics_mapped[key].publishers = [];
            for (var subscriber in topics[key].subscribers) {
              topics_mapped[key].subscribers.push(topics[key].subscribers[subscriber].name);
            }
            for (var publisher in topics[key].publishers) {
              topics_mapped[key].publishers.push(topics[key].publishers[publisher].name);
            }
          }
          console.log(topics_mapped);
          ws.send(JSON.stringify({event: 'topics', topics: topics_mapped}));
          break;
        case 'broadcast_to_frontends':
          for (var key in frontends) {
            frontends[key].send('mensaje broadcastado');
          }
          break;
        case 'subscribeTo':
          // console.log('Se suscribio a %s', message.topic);
          if (topics[message.topic] === undefined)
            topics[message.topic] = {publishers: [], subscribers: [], type: 'none'}
          topics[message.topic].subscribers.push(ws);
          ws.subscribedTo.push(message.topic);
          updateTopics();
          break;
        case 'unsubscribeFrom':
          // console.log('Se desuscribió de %s', message.topic);
          if (topics[message.topic] !== undefined) {
            var index = topics[message.topic].subscribers.indexOf(ws);
            if (index > -1) topics[message.topic].subscribers.splice(index, 1);
            var index = ws.subscribedTo.indexOf(message.topic);
            if (index > -1) ws.subscribedTo.splice(index, 1);
          }
          updateTopics();
          break;
        default:
          console.log('no se reconoció el evento');
        }
      }

      switch(ws.type) {
      case 'frontend':
        console.log('Mensaje de FRONTEND');
        break;
      case 'subscriber':
        console.log('Mensaje de SUBSCRIBER');
        break;
      case 'publisher':
        var msg = {
          event: 'data',
          topic: ws.topic,
          data: message.data,
          timestamp: message.timestamp
        };
        for (var key in topics[ws.topic].subscribers) 
          topics[ws.topic].subscribers[key].send(JSON.stringify(msg));
        break;
      default:
        configure(message, ws, function error() {
          console.log('es un socket no identificado, por favor identifiquese');
        });
      }

    });

    ws.on('close', function close(code, message) {
      console.log('Se desconectó un socket');
      if (ws.type === 'frontend') {
        console.log('Se desconectó un frontend');
        var index = frontends.indexOf(ws);
        if (index > -1) frontends.splice(index, 1);
        for (var key in ws.subscribedTo) {
          var index = topics[ws.subscribedTo[key]].subscribers.indexOf(ws);
          if (index > -1) topics[ws.subscribedTo[key]].subscribers.splice(index, 1);
        }
        updateTopics();
      } else if (ws.type === 'publisher') {
        console.log('Se desconectó un publisher');
        var index = topics[ws.topic].publishers.indexOf(ws);
        if (index > -1) topics[ws.topic].publishers.splice(index, 1);
        updateTopics();
      }
    });

  });

  wss.on('error', function (error) {
    console.log('Error en el ws: ');
    console.log(error);
  });
};
