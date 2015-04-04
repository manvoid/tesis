module.exports = function (io) {
  'use strict';

  var publishersList = {};
  var subscribersList = {};
  var frontendsList = [];

  var getPublishersNames = function () {
    var names = [];
    for (var name in publishersList) {
      names.push(name);
    }
    return names;
  };

  var getSubscribersNames = function () {
    var names = [];
    for (var id in subscribersList) {
      names.push(subscribersList[id].name);
    }
    return names;
  };

  var sendToFrontends = function (event, data) {
    for (var key in frontendsList) {
      io.to(frontendsList[key]).emit(event, data);
    }
  };

  io.on('connection', function (socket) {
    console.log('Conexión establecida');
    socket.on('message', function (msg) {
      console.log('recieved message from ',
                  'msg', JSON.stringify(msg));
      console.log('Las conexiones son');
      console.log('Publicadores');
      console.log(getPublishersNames());
      console.log('Suscriptores');
      console.log(getSubscribersNames());
      console.log('Navegadores');
      console.log(frontendsList);
    });

    var onPublisherData = function (name) {
      return function (msg) {
        var sockets = publishersList[name].subscribers;
        for (var i in sockets) {
          io.to(sockets[i]).emit('data', {'name': name, 'data': msg.data});          
        }
      };
    };

    var onSubscriberData = function (msg) {
      console.log('Se recibió un dato de un suscriptor ');
      console.log(msg);
    };

    socket.on('configure', function (msg) {
      var that = this;
      switch (msg.type) {
      case 'frontend':
        console.log('Se agregará un nuevo frontend');
        console.log(msg);
        frontendsList.push(socket.id);
        that.on('disconnect', function () {
          console.log('navegador desconectado');
          var index = frontendsList.indexOf(that.id);
          if (index > -1) { frontendsList.splice(index, 1); }
        }); 
        break;
      case 'publisher':
        console.log('Se está agregando un Publisher');
        // publishersList[socket.id] = {};
        // publishersList[socket.id].sockets = [];
        // publishersList[socket.id].name = msg.name;
        // that.on('data', onPublisherData(msg.name));
        // that.on('disconnect', function () {
        //   console.log('Publisher desconectado');
        //   delete publishersList[that.id];
        // });
        publishersList[msg.name] = {};
        publishersList[msg.name].socket = socket.id;
        publishersList[msg.name].subscribers = [];
        publishersList[msg.name].name = msg.name;
        that.on('data', onPublisherData(msg.name));
        that.on('disconnect', function () {
          console.log('Publisher desconectado');
          delete publishersList[msg.name];
          sendToFrontends('nodeChange', {remove: msg.name});
        });
        sendToFrontends('nodeChange', {add: msg.name});
        break;
      case 'subscriber':
        subscribersList[socket.id] = {};
        subscribersList[socket.id].name = msg.name;
        that.on('data', onSubscriberData);
        that.on('disconnect', function () {
          delete subscribersList[that.id];
        });
        break;
      default:
        console.log('Configure type not recognized');
      }
    });

    socket.on('getNodesNames', function (msg) {
      console.log('Se emitieron nombres de nodos');
      console.log(getPublishersNames());
      socket.emit('nodesNames', {
        'subscribers': getSubscribersNames(),
        'publishers': getPublishersNames()
      });
    });

    socket.on('subscribeTo', function (msg) {
      if (publishersList[msg.name] !== undefined) {
        console.log('Se suscribió a un publicador');
        publishersList[msg.name].subscribers.push(socket.id);
      } else {
        console.log('no se encontró ese nombre para suscribirse');
      }
    });

    socket.on('unsubscribeFrom', function (msg) {
      if (publishersList[msg.name] !== undefined) {
        console.log('Se unsuscribió un publicador');
        var index = publishersList[msg.name].subscribers.indexOf(socket.id);
        if (index > -1) { publishersList[msg.name].subscribers.splice(index, 1); }
      } else {
        console.log('no se encontró ese nombre para suscribirse');
      }
    });
  });

  // io.on('connection', function (socket) {
  //   console.log('Conexión establecida');
  //   socket.emit('news', { hello: 'world' });
  //   socket.on('my other event', function (data) {
  //     console.log(data);
  //   });
  // });
};
