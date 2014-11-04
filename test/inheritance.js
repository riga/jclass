var Class = require("../index.js");

var Cat = Class._extend({

  init: function(color) {
    this.color = color;
    this.sleepCounter = 0;
  },

  meow: function() {
    console.log("An abstract cat cannot meow!");
  },

  sleep: function() {
    this.sleepCounter++;
    return this;
  }
}, {
  family: "Felidae"
});

var Lion = Cat._extend({

  init: function() {
    this.init._super.call(this, "sandy");
  },

  meow: function() {
    console.log("Roooaaar!");
  },

  sleep: function() {
    this.sleep._super.call(this);

    // a lion sleeps again after he slept
    this.sleepCounter++;

    return this;
  }
}, {
  getFamily: function() {
    // return Lion._members.family;
    // same as
    return this.family;
  }
});



var cat = new Cat();
var lion = new Lion();

[cat, lion].forEach(function(c) {
  c.meow();
});

console.log("\nValue Checks:\n-------------");

console.log("sandy", lion.color);
console.log("Felidae", Cat._members.family);
console.log("Felidae", Lion._members.family);
console.log(undefined, Cat._members.getFamily);
console.log("Felidae", Lion._members.getFamily());
console.log(true, Class._subClasses[0] == Cat);
console.log(true, Class._subClasses[1] == Cat._members._class);
console.log(undefined, Class._subClasses[2]);
console.log(true, Lion._extends(Cat));
console.log(true, Lion._superClass == Cat);
console.log(true, cat._class == Cat);


console.log("\nSpeed Tests:\n-------------");

var t1 = (new Date()).getTime();
for (var i = 0; i < 10000000; ++i) {
  lion.sleep();
}
var t2 = (new Date()).getTime();
console.log("time:", t2-t1);
console.log(lion.sleepCounter);
