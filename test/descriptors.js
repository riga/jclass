var assert = require("assert"),
    Class  = require("../index.js");


// initialize objects to test
var MyClass = Class._extend({

  // accessor descriptor
  foo: {
    descriptor: true,
    get: function() {
      return 123;
    }
  },

  get2Foo: function() {
    return this.foo * 2;
  },

  // data descriptor
  bar: {
    descriptor: true,
    value: "some value",
    enumerable: true
  }

});

var myInstance = new MyClass();


// begin tests
describe("Descriptors", function() {

  describe("#getter-1", function() {
    it("should return the value of foo", function() {
      assert.equal(123, myInstance.foo);
    });
  });

  describe("#getter-2", function() {
    it("should return the value of foo times 2", function() {
      assert.equal(246, myInstance.get2Foo());
    });
  });

  describe("#getter-3", function() {
    it("should return the value of bar", function() {
      assert.equal("some value", myInstance.bar);
    });
  });

  describe("#enumerable", function() {
    it("should return true when 'bar' is found in keys of class prototype", function() {
      assert.equal(true, !!~Object.keys(myInstance._class.prototype).indexOf("bar"));
    });
  });

});
