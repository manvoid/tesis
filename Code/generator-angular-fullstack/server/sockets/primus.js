module.exports = function (primus) {
  'use strict';

  primus.on('connection', function (spark) {
    console.log('new connection of socket');
    spark.on('data', function (message) {
      console.log('received: %s', message);
      //console.log(primus.clients);
      spark.write({'data':'hola mundo'});
    });

    spark.on('end', function (spark) {
      console.log('se desconectó el socket: ');
      console.log(spark.id);
    });

    spark.write({'data':'something'});
  });

  primus.on('error', function (error) {
    console.log('Error en el primus: ');
    console.log(error);
  });
};
