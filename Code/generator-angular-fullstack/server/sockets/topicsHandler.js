
var topics = {};

topicsHandler = {};

topicsHandler.create = function (topic) {
  if (typeof topics[topic.node] === 'undefined') {
    topics[topic.node] = {};
  }
  if (typeof topics[topic.node][topic.name] === 'undefined') {
    topics[topic.node][topic.name] = [];
  }
};

topicsHandler.addNodeToTopic = function (node, topic) {
  if (typeof topics[topic.node] === 'undefined') {
    topics[topic.node] = {};
  }
  if (typeof topics[topic.node][topic.name] === 'undefined') {
    topics[topic.node][topic.name] = []
  }
  topics[topic.node][topic.name].push(node);
};

topicsHandler.addSubscriptorToTopic = function (subscriptor, topic) {
  if (typeof topics[topic.node] === 'undefined') {
    topics[topic.node] = {};
  }
  if (typeof topics[topic.node][topic.name] === 'undefined') {
    topics[topic.node][topic.name] = []
  }
  topics[topic.node][topic.name].push(subscriptor);
};

topicsHandler.removeSubscriptorFromTopic = function (subscriptor, topic) {
  var index = topics[topic.node][topic.name].indexOf(node);
  if (index > -1)
    topics[topic.node][topic.name].splice(index, 1);
};

topicsHandler.removeNodeFromTopic = function (node, topic) {
  var topicSubscribers = topics[topic.node][topic.name];
  for (var i=topicSubscribers.length-1; i>=0; i--) {
    console.log('Elemento ' + i + ' de los suscriptores');
    console.log(JSON.stringify(topicSubscribers[i]));
    if (topicSubscribers[i].node === node) {
      topicSubscribers.splice(i, 1);
    }
  }
  console.log('Tópico despues de remover el nodo ' + node);
  console.log(topics[topic.node][topic.name]);
};

topicsHandler.getSubscriptions = function (topic) {
  return topics[topic.node][topic.name];
};

topicsHandler.removeNodeFromTopics = function (node, topicsList) {

  console.log('Se va a eliminar un nodo de los tópicos');
  console.log(JSON.stringify(topicsList) + ' ');
  for (var i=0; i<topicsList.length; i++) {
    var topic = topicsList[i];
    
    console.log('Tópico antes: ');
    console.log(JSON.stringify(topics[topic.node][topic.name]));
    for (var j=0; j<topics[topic.node][topic.name].length; j++) {
      var subscriptor = topics[topic.node][topic.name][j];
      if (subscriptor.node === node)
        topics[topic.node][topic.name].splice(j, 1);
    }
    console.log('Tópico después: ');
    console.log(JSON.stringify(topics[topic.node][topic.name]));
  }
  console.log(JSON.stringify(topics));
};

module.exports = topicsHandler;
