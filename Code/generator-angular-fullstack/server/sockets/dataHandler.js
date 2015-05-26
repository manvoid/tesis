dataContainer = {}

dataHandler = {}

dataHandler.update = function (socket, data, timestamp) {
  // if (data[socket] === undefined)
  //   data[socket] = {};

  timestamp = timestamp || Date.now();

  for (elem in data) {
    dataContainer[socket][elem].value = data[elem];
    dataContainer[socket][elem].timestamp = timestamp;
  }
};

dataHandler.create = function (socket, data) {
  dataContainer[socket] = {};

  data.forEach(function (data) {
    dataContainer[socket][data] = {};
    dataContainer[socket][data].value = 0;
    dataContainer[socket][data].timestamp = 0;
  });
  
};

dataHandler.get = function (socket, data) {
  if (dataContainer[socket])
    return dataContainer[socket][data];
}

module.exports = dataHandler;
