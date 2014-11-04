# jclass

![](https://nodei.co/npm/jclass.png?downloads=True&stars=True)

*jclass* started as a port of John Resig's lightweight OO inheritance model. However, this implementation is
faster as it avoids threefold method wrapping (see [here](http://techblog.netflix.com/2014/05/improving-performance-of-our-javascript.html)). In addition, it provides class members, various conveniences and conversion of prototype-based classes.

*jclass* has no dependencies and works in most import environments:
RequireJS (AMD), CommonJS, NodeJs and web browsers.

**Note:** The current version (1.X.X) is a merge of the [node-oo](https://github.com/riga/node-oo) project and the previous version of *jclass* (0.2.X). For legacy code, see the [v0.2.X branch](https://github.com/riga/jclass/tree/v0.2.X).

## Installation

*jclass* is hosted at [npmjs](https://www.npmjs.org/package/jclass). Install it via:

```
npm install jclass
```


## Examples

#### Simple Inheritance

```javascript
var Class = require("jclass");

var Cat = Class._extend({

  // constructor
  init: function(color) {
    this.color = color;
  },

  // instance method
  meow: function() {
    console.log("An abstract cat cannot meow!");
  },
  
  // instance method
  getColor: function() {
    return this.color;
  }

});


var GrumpyCat = Cat._extend({

  // constructor
  init: function init() {
    init._super.call(this, "greyish");
    
	// if you don't want to use a named function you can also use
	// this.init._super.call(this, "greyish");
  },

  // instance method
  meow: function() {
    console.log("Nah, not in the mood.");
  }

});

var cat = new Cat("black");
cat.meow(); // "An abstract cat cannot meow!"

var grumpy = new GrumpyCat();
grumpy.meow(); // "Nah, not in the mood."
grumpy.getColor(); // "greyish", same as grumpy.color

console.log(grumpy instanceof GrumpyCat); // true
console.log(grumpy instanceof Cat); // true
console.log(GrumpyCat._extends(Cat)); // true, same as GrumpyCat._superClass == Cat
console.log(GrumpyCat._extends(Class)); // true

```


#### Class members

```javascript
var Class = require("jclass");

var Cat = Class._extend({

  // constructor
  init: function(color) {
    this.color = color;
  },

  // instance method
  meow: function() {
    console.log("An abstract cat cannot meow!");
  }

}, {
  family: "Felidae",
  
  getFamily: function() {
    console.log(this.family);
    // same as
    // console.log(Cat._members.family);
  }
});

Cat._members.getFamily()); // "Felidae", same as Cat._members.family
```

**Please note** that ``this`` within class methods references the ``_members`` instance itself.


#### Converting Prototyped Classes

You can convert prototype-base classes into jclasses.

```javascript
// example using nodejs

var Class        = require("node-oo");
var EventEmitter = require("events").EventEmitter;

var Emitter = Class._convert(EventEmitter);

var emitter = new Emitter();
emitter.on("topic", function() { ... });
emitter.emit("topic", ...);
});

```

The instance of the (original) prototyped class is stored as ``_prototype`` in each jclass instance.


## API

#### Classes

Classes have the following attributes:

- ``_extend`` (``function(instanceMembers, classMembers)``): Derives a new class with ``instanceMembers`` and ``classMembers`` ([example](#simple-inheritance)).
- ``_extends`` (``function(Class)``): Returns ``true`` (``false``) if ``Class`` is (is not) **a** super class.
- ``_superClass`` (``Class``): The super class (not available for the base ``Class``).
- ``_subClasses`` (``array``): An array containing all (**directly inheriting**) sub classes.
- ``_members`` (``Class instance``): A jclass instance that handles the class members ([example](#class-members)).


The base ``Class`` has additional attributes that are not propagated to derived classes:

- ``_convert`` (``Function(cls, options)``): Converts a prototype based class ``cls`` into a jclass ([example](#converting-prototyped-classes)).
- ``_construct`` (``Function(cls, args)``): Returns an instance of ``cls``, instantiated with ``args``. This is an ``apply``-like usage for ``new``.


#### Instances

All instances have the following attributes:

- ``_class`` (``Class``): The class of this instance

Within instance methods, the *super* method is always referenced as ``_super``. 

If the option ``exposeClassMembers`` is ``true``, each instance can directly access class members **within instance methods**. You can use the ``_class`` attribute outside of instance methods or if ``exposeClassMembers`` is ``false``.





## Development

- Source hosted at [GitHub](https://github.com/riga/jclass)
- npm module hosted at [npmjs](https://www.npmjs.org/package/jclass)
- Report issues, questions, feature requests on [GitHub Issues](https://github.com/riga/jclass/issues)


## Authors

Marcel R. ([riga](https://github.com/riga))


