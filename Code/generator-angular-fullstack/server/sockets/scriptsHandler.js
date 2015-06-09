var events = require('events');
var eventEmitter = new events.EventEmitter();

function Script (configuration, init) {
  this.script = configuration.script;
  // this.type = configuration.type;
  // this.interval = undefined;
  this.intervalTime = configuration.intervalTime || 200;
  this.listeners = {};
  // this.run = configuration.run;
  // this.subscribers = [];
  // this.initFunction;
  // this.spin = function () {};

  
  this.init = init;

  this.init();
  this.interval = setInterval(this.spin, this.intervalTime);
  // switch (configuration.type) {
  // case 'listener':
  //   var that = this;
  //   this.node = configuration.node;
  //   this.data = configuration.data;
  //   this.waiting = false;
  //   this.run = function () {
  //     var value = this.get(that._node, that._data);
  //     var response = {subscribers: that.subscribers, data: {}};
  //     response[that._data] = value;
  //     return response;
  //   }
  //   break;
  // }
};

Script.prototype.addListener = function (event, func, interval) {
  if (this.listeners[event] !== undefined) {
    eventEmitter.removeListener(event, this.listener[event]);
  }

  this.listeners[event] = func;
  eventEmitter.on(event, func);
};

Script.prototype.setIntervalTime = function (time) {
  if (this.interval !== undefined) {
    clearInterval(this.interval);
  }
  this.intervalTime = time;
  this.interval = setInterval(this.spin, time);
};

// Script.prototype.spin = function () {
//   if (this.intervalTime === 0) {
//     // this.run();
//     return true;
//   } else if (!this._waiting) {
//     var that = this;
//     // this.run(data);
//     this._waiting = true;
//     this._interval = setTimeout(function () {
//       that._waiting = false;
//       // that._interval = undefined;
//     }, this.intervalTime);
//     return true;
//   }
// };

// Script.prototype.startInterval = function () {
//   if (this._interval === undefined) {
//     this._interval = setInterval(this.run, this._intervalTime);
//   } else {
//     console.log('Se intentó iniciar el _intervalo pero este ya existe');
//   }
// };

// Script.prototype.stopInterval = function () {
//   if (this._interval !== undefined) {
//     clearInterval(this._interval);
//     this._interval = undefined;
//   } else {
//     console.log('Se intentó detener el intervalo pero este no existe');
//   }
// };

Script.prototype.getInfo = function () {
  var info = {};
  info.script = this._script;
  // info.type = this._type;
  info.isRunning = (this._interval !== undefined ? true : false);
  // switch (this._type) {
  // case 'listener':
  //   info.node = this._node;
  //   info.data = this._data;
  //   break;
  // }
  return info;
};

// Script.prototype.setIntervalTime = function (time) {
//   this._intervalTime = time;
// };

Script.prototype.stop = function () {
  for (var event in this.listeners) {
    eventEmitter.removeListener(event, this.listeners[event]);
  }
  clearInterval(this.interval);
};

Script.prototype.start = function () {
  this.init();
  this.interval = setInterval(this.spin, this.intervalTime);
};

var scripts = {};
var scriptsCount = 0;

// config for the script,

var scriptsHandler = {};

scriptsHandler.getScriptInfo = function (script) {
  if (scripts[script] !== undefined)
    return scripts[script].getInfo();
  else
    console.log('error getting script info');
};

scriptsHandler.getScriptsInfo = function () {
  var info = {};
  for (var script in scripts) {
    info[script] = scripts[script].getInfo();
  }
  return info;
};

scriptsHandler.createScript = function (configuration, init) {
  var script = configuration.script || 'script' + scriptCount++;
  scripts[script] = new Script(configuration, init);
  // eventEmitter.on(configuration.node + ':' + configuration.data, function (data) { scripts[script].spin(data); });
  // return script;
};

// scriptsHandler.startScriptInterval = function (script) {
//   if (scripts[script] !== undefined) {
//     scripts[script].startInterval();
//   }
// };

// scriptsHandler.setScriptRun = function (script, run) {
//   if (scripts[script] !== undefined) {
//     scripts[script].run = run;
//   }
// };

scriptsHandler.setScriptIntervalTime = function (script, time) {
  if (scripts[script] !== undefined) {
    scripts[script].setIntervalTime(time);
  }
};

scriptsHandler.spinScript = function (script) {
  return scripts[script].spin();
};

scriptsHandler.runScript = function (script) {
  return scripts[script].run.call(this);
};

scriptsHandler.addSubscriberToScript = function (node, script) {
  scripts[script].subscribers.push(node);
};

scriptsHandler.emit = function (event, data) {
  eventEmitter.emit(event, data);
};

module.exports = scriptsHandler;
