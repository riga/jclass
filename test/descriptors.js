var assert = require("assert"),
    JClass = require("../index.js");


// initialize objects to test
var MyClass = JClass._extend({

  init: function init() {
    init._super.call(this);

    this._someValue = 100;
  },

  // normal getter
  someValue: function() {
    return this._someValue;
  },

  // accessor descriptor
  half: {
    descriptor: true,
    get: function() {
      return this._someValue * 0.5;
    },
    set: function(value) {
      this._someValue = value * 2;
    }
  },

  // getter/setter syntax
  set twice(value) {
    this._someValue = value * 0.5;
  },

  get twice() {
    return this._someValue * 2;
  },

  // data descriptor
  bar: {
    descriptor: true,
    value: "some value",
    enumerable: false
  }
});

var MySubClass = MyClass._extend({
  get twice() {
    var _super = JClass._superDescriptor(this, "twice");
    return _super.get.call(this) * 4;
  }
});

var myInstance    = new MyClass();
var mySubInstance = new MySubClass();



// begin tests
describe("Descriptors", function() {

  describe("#getter-1", function() {
    it("should return the value of someValue", function() {
      assert.equal(100, myInstance._someValue);
    });
  });

  describe("#getter-2", function() {
    it("should return the value of someValue", function() {
      assert.equal(100, myInstance.someValue());
    });
  });

  describe("#getter-3", function() {
    it("should return half value of someValue", function() {
      assert.equal(50, myInstance.half);
    });
  });

  describe("#getter-4", function() {
    it("should return twice value of someValue", function() {
      assert.equal(200, myInstance.twice);
    });
  });

  describe("#getter-5", function() {
    it("should return the value of bar", function() {
      assert.equal("some value", myInstance.bar);
    });
  });

  describe("#getter-6", function() {
    it("should return the value of someValue times 8", function() {
      assert.equal(800, mySubInstance.twice);
    });
  });

  describe("#enumerable", function() {
    it("should return true when 'bar' is not found in keys", function() {
      var found = false;
      for (var key in myInstance) {
        if (key == "bar") {
          found = true;
          break;
        }
      }
      assert.equal(false, found);
    });
  });

});
