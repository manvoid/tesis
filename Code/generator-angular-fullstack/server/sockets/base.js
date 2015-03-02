module.exports = function (io) {
  'use strict';
  io.on('connection', function (socket) {
    console.log('Conexión establecida');
    socket.on('message', function (from, msg) {

      console.log('recieved message from',
                  from, 'msg', JSON.stringify(msg));

      console.log('broadcasting message');
      console.log('payload is', msg);
      io.sockets.emit('broadcast', {
        payload: msg,
        source: from
      });
      console.log('broadcast complete');
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
