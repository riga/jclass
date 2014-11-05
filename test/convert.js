var EventEmitter = require("events").EventEmitter;

var Class = require("../index.js");

EventEmitter.prototype.someMember = 123;

var Emitter = Class._convert(EventEmitter);

var e = new Emitter();

e.on("test", function() {
  console.log(arguments);
});

e.emit("test", "foo", "bar");

console.log(e.someMember);
