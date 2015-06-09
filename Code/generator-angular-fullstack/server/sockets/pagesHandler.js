function Widget (configuration) {
  this.type = configuration.type;
  this.style = configuration.style;

  switch (this.type) {
  case 'echo':
    this.connections = [{from: configuration.listenTopic, to: {node: 'this'}}];
    break;
  }
}

Widget.prototype.getInfo = function () {
  var that = this;
  var info = {
    type: that.type,
    style: that.style,
    connections: that.connections
  };

  return info;
}

var pages = [
  {
    widgets: [],
    title: 'Mi página'
  },
  {
    widgets: [],
    title: 'Otra página'
  }
];

var pagesHandler = {};

pagesHandler.addWidgetToPage = function (widgetConf, page) {
  var widget = new Widget({
    style: widgetConf.style,
    type: widgetConf.type,
    listenTopic: widgetConf.listenTopic
  });
  pages[page].widgets.push(widget);
};

pagesHandler.getWidgetsFromPage = function (page) {
  console.log('En pages handler se están pidiendo widgets de ' + page);
  var widgetsInfo = [];
  for (var i=0; i<pages[page].widgets.length; i++) {
    var widget = pages[page].widgets[i];
    widgetsInfo.push(widget.getInfo());
  }
  return widgetsInfo;
};

pagesHandler.getPagesInfo = function () {
  var pagesInfo = [];
  // for (var page in pages) {
  //   pagesInfo[page] = {
  //     title: pages[page].title,
  //     link: pages[page].link
  //   };
  //   pagesInfo[page].widgets = this.getWidgetsFromPage(page);
  // }
  for (var page=0; page<pages.length; page++) {
    pagesInfo[page] = {
      title: pages[page].title,
      link: pages[page].link
    };
    pagesInfo[page].widgets = this.getWidgetsFromPage(page);
  }
  return pagesInfo;
};

module.exports = pagesHandler;
