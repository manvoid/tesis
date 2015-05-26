function Widget () {
  this._interval = undefined;
  this._intervalTime = 100;
  this.run = function () {
    console.log('se corrió el widget');
  };
};

Widget.prototype.startInterval = function () {
  if (this._interval === undefined) {
    this._interval = setInterval(this.run, this._intervalTime);
  } else {
    console.log('Se intentó iniciar el _intervalo pero este ya existe');
  }
};

Widget.prototype.stopInterval = function () {
  if (this._interval !== undefined) {
    clearInterval(this._interval);
    this._interval = undefined;
  } else {
    console.log('Se intentó detener el intervalo pero este no existe');
  }
};

Widget.prototype.setIntervalTime = function (time) {
  this._intervalTime = time;
};

var widgets = {};

// config for the widget,

var widgetsHandler = {};

widgetsHandler.createWidget = function (widget) {
  widgets[widget] = new Widget();
};

widgetsHandler.startWidgetInterval = function (widget) {
  if (widgets[widget] !== undefined) {
    widgets[widget].startInterval();
  }
};

widgetsHandler.setWidgetRun = function (widget, run) {
  if (widgets[widget] !== undefined) {
    widgets[widget].run = run;
  }
};

widgetsHandler.setWidgetIntervalTime = function (widget, time) {
  if (widgets[widget] !== undefined) {
    widgets[widget].setIntervalTime(time);
  }
};

module.exports = widgetsHandler;
