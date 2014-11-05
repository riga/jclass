var Class = require("../index.js");

var MyClass = Class._extend({
  foo: {
    descriptor: true,
    get: function() {
      return 123;
    }
  },

  get2Foo: function() {
    return this.foo * 2;
  }
});


var myInstance = new MyClass();

console.log(myInstance.foo);
console.log(myInstance.get2Foo());
