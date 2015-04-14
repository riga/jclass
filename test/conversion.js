var assert       = require("assert"),
    EventEmitter = require("eventemitter2").EventEmitter2,
    JClass       = require("../index.js");


// initialize objects to test
EventEmitter.prototype.someMember = 123;

var Emitter = JClass._convert(EventEmitter);

var emitter = new Emitter({ wildcard: true });


// begin tests
describe("Conversion", function() {

  describe("#properties", function() {
    it("should return 123", function() {
      assert.equal(123, emitter.someMember);
    });
  });

  describe("#emit", function() {
    it("should emit 'test' with arg 123", function(done) {
      emitter.on("test", function(arg) {
        done(arg === 123 ? null : "wrong arg value");
      });

      emitter.emit("test", 123);
    });
  });

  describe("#emitGroup", function() {
    it("should emit 'foo.*' with arg 123", function(done) {
      emitter.on("foo.*", function(arg) {
        done(arg === 123 ? null : "wrong arg value");
      });

      emitter._origin.emit("foo.bar", 123);
    });
  });

});
