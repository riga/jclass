var jClass = require("../lib/jclass.min");

var theClass = jClass.extend({
    init: function() {
         this.__privateProperty = 0;
    },
    increase: function() {
        this.__privateProperty++;
    },
    show: function() {
        return this.__privateProperty;
    }
});

var foo = new theClass();
foo.increase();
console.log(foo.show());
