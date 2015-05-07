# jclass

[![jclass](https://nodei.co/npm/jclass.png?downloads=True&stars=True)](https://www.npmjs.com/package/jclass)

*jclass* started as a port of [John Resig's lightweight OO inheritance model](http://ejohn.org/blog/simple-javascript-inheritance/). However, this implementation is faster as it avoids threefold method wrapping (see [here](http://techblog.netflix.com/2014/05/improving-performance-of-our-javascript.html)). In addition, it provides class members, property descriptors, conversion of prototype-based classes and various conveniences.

*jclass* has no dependencies and works in most import environments:
RequireJS (AMD), CommonJS, NodeJs and web browsers.

**Note:** The current version (1.X.X) is a merge of the [node-oo](https://github.com/riga/node-oo) project and the previous version of *jclass* (0.2.X). For legacy code, see the [v0.2.X branch](https://github.com/riga/jclass/tree/v0.2.X).

## Installation

*jclass* is hosted at [npmjs](https://www.npmjs.org/package/jclass). Install it via:

```
npm install jclass
```


## Examples

All examples below use NodeJs but the *jclass* related code would also work in other environments.

#### Simple Inheritance

```javascript
var JClass = require("jclass");

var Cat = JClass._extend({

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

// instanceof works as expected
console.log(grumpy instanceof GrumpyCat); // true
console.log(grumpy instanceof Cat); // true
console.log(GrumpyCat._extends(Cat)); // true, same as GrumpyCat._superClass == Cat
console.log(GrumpyCat._extends(JClass)); // true
```


#### Class members

Class members are accessible via the ``_members`` property which is itself a jclass instance. To add class members,
add a second paramter to ``_extend``.

```javascript
var JClass = require("jclass");

var Cat = JClass._extend({
  // instance members

  // constructor
  init: function(color) {
    this.color = color;
  },

  // instance method
  meow: function() {
    console.log("An abstract cat cannot meow!");
  }

}, {
  // class members

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


#### Property Descriptors

All instance and class members given to ``_extend`` can also be applied as property descriptors that are passed to [``Object.defineProperty``](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty). There are two approaches.


##### Descriptors

Define members as objects and add a property ``descriptor: true``. Both, accessor-type and data-type descriptors are supported.

```javascript
var JClass = require("jclass");

var MyClass = JClass._extend({

  someKey: {
    descriptor: true,
    get: function() {
      return "some value";
    }
  }

});

var myInstance = new MyClass();
console.log(myInstance.someKey); // "some value"
```

##### Getter/Setter Syntax

Use getter/setter syntax. This is equivalent to the accessor-type descriptor definition.

```javascript
var JClass = require("jclass");

var MyClass = JClass._extend({

  set someKey(value) {
    // do sth with "value", e.g.
    this._someKey = value;
  },
  
  get someKey() {
    // do sth to return a value, e.g.
    return this._someKey * 2;
  }

});

var myInstance = new MyClass();
myInstance.someKey = 123;
console.log(myInstance.someKey); // 246
```


#### Converting Prototyped Classes

You can convert prototype-base classes into jclasses. This approach supports constructor arguments.

```javascript
// example using nodejs

var JClass       = require("jclass");
var EventEmitter = require("events").EventEmitter;

var Emitter = JClass._convert(EventEmitter);

var emitter = new Emitter();
emitter.on("topic", function() { ... });
emitter.emit("topic", ...);
});
```

The instance of the (original) prototyped class is stored as ``_origin`` in each jclass instance.


## API

#### Classes

Classes have the following attributes:

- ``_extend(instanceMembers, classMembers)``: Derives a new class with *instanceMembers* and *classMembers* ([example](#simple-inheritance)).
- ``_extends(JClass)``: Returns *true* (*false*) if ``JClass`` is (is not) a super class.
- ``_superClass``: The super class (not available for the base ``JClass``).
- ``_subClasses``: An array containing all (**directly inheriting**) sub classes.
- ``_members``: A jclass instance holding the class members ([example](#class-members)).


The base ``JClass`` has additional attributes that are not propagated to derived classes:

- ``_convert(cls, options)``: Converts a prototype based class *cls* into a jclass ([example](#converting-prototyped-classes)).
- ``_construct(cls, args)``: Returns an instance of *cls*, instantiated with *args*. This is an *apply*-like usage for the *new* operator.


#### Instances

All instances have the following attributes:

- ``_class``: The class of this instance.

Within instance methods, the *super* method is always referenced as ``_super``. You can access them by making your instance method a named function ([example](#simple-inheritance)).


## Development

- Source hosted at [GitHub](https://github.com/riga/jclass)
- npm module hosted at [npmjs](https://www.npmjs.org/package/jclass)
- Report issues, questions, feature requests on [GitHub Issues](https://github.com/riga/jclass/issues)


## Authors

Marcel R. ([riga](https://github.com/riga))


