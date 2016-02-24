var assert = require("assert"),
    JClass = require("../index.js");


// initialize objects to test
var Cat = JClass._extend({
  // instance members

  init: function(color) {
    this.color = color;

    this.sleeping = false;
  },

  meow: function() {
    // an abstract cat cannot meow
    throw new Error("not implemented");
  },

  sleep: function() {
    this.sleeping = true;
  }

}, {
  // class members

  family: "Felidae"

});

var Lion = Cat._extend({
  // instance members

  init: function() {
    this.init._super.call(this, "sandy");
  },

  meow: function() {
    return "Roooaaar!";
  },

  myFamily: function() {
    return this._class._members.getFamily();
  }

}, {
  // class members

  getFamily: function() {
    return this.family;
    // same as
    // return Lion._members.family;
  }
});

var cat  = new Cat();
var lion = new Lion();


// begin tests
describe("Inheritance", function() {

  describe("#attribute", function() {
    it("should return the color of lion", function() {
      assert.equal("sandy", lion.color);
    });
  });

  describe("#class-members-1", function() {
    it("should return the family of Cat", function() {
      assert.equal("Felidae", Cat._members.family);
    });
  });

  describe("#class-members-2", function() {
    it("should return the family of Lion", function() {
      assert.equal("Felidae", Lion._members.family);
    });
  });

  describe("#class-members-3", function() {
    it("should return undefined", function() {
      assert.equal(undefined, Cat._members.getFamily);
    });
  });

  describe("#class-members-4", function() {
    it("should return the family of Lion", function() {
      assert.equal("Felidae", Lion._members.getFamily());
    });
  });

  describe("#class-members-5", function() {
    it("should return the family of Lion via an instance call", function() {
      assert.equal("Felidae", lion.myFamily());
    });
  });

  describe("#sub-class-1", function() {
    it("should return the true if Cat is in JClass' subclasses", function() {
      assert.equal(true, !!~JClass._subClasses.indexOf(Cat));
    });
  });

  describe("#extends-1", function() {
    it("should return true if Lion extends JClass", function() {
      assert.equal(true, Lion._extends(JClass));
    });
  });

  describe("#extends-2", function() {
    it("should return true if Lion extends Cat", function() {
      assert.equal(true, Lion._extends(Cat));
    });
  });

  describe("#extends-3", function() {
    it("should return true if Lion extends Cat", function() {
      assert.equal(true, Lion._superClass == Cat);
    });
  });

  describe("#extends-4", function() {
    it("should return false if Cat does not extend Lion", function() {
      assert.equal(false, Cat._extends(Lion));
    });
  });

  describe("#instanceof-1", function() {
    it("should return true if cat is an instance of Cat", function() {
      assert.equal(true, cat instanceof Cat);
    });
  });

  describe("#instanceof-2", function() {
    it("should return true if cat is an instance of Cat", function() {
      assert.equal(true, cat._class == Cat);
    });
  });

  describe("#instanceof-3", function() {
    it("should return true if lion is an instance of Cat", function() {
      assert.equal(true, lion instanceof Cat);
    });
  });

  describe("#instanceof-4", function() {
    it("should return true if cat is not an instance of Lion", function() {
      assert.equal(true, !(cat instanceof Lion));
    });
  });

});
