# **JClass**

*Advanced JavaScript inheritance model providing __genuine private members__ based on [John Resig's Inheritance Class](http://ejohn.org/blog/simple-javascript-inheritance/)*

https://npmjs.org/package/jclass


## Synopsis

JClass is a lightweight and flexible JavaScript inheritance model providing **genuine private
members** using closures. It's applicable in nodejs and normal web browsers. JClass is
implemented using `prototype`'s and brings along multiple features like e.g. propper (and even
inheritance consistent)`instanceof` calls. To come straight to the point:

```javascript
var Animal = JClass.extend({

    // the constructor method
    init: function(name) {
        // a public value
        this.name = name;
    },

    // a public method
    eat: function() {
        return this.name + ' eats';
    },

    // a private method, indicated by 2 leading underscores
    __behave: function() {
        return this.name + ' behaves';
    }
});

// inherit from 'Animal'
var Cat = Animal.extend({

    init: function(name, color) {
        // call 'init' of the super-class
        this._super(name);
        this.color = color;

        // a private value, indicated by 2 leading underscores
        this.__lives = 9;
    },

    // overwrite 'eat'
    eat: function() {
        var msg = this.__behave();
        // 'this._super' references Animal's 'eat' method
        return msg + ' because ' + this._super() + ' fish';
    },

    // getter for '__lives'
    getLives: function() {
        return this.__lives;
    }
});

var simon = new Cat('simon', 'white');
console.log(simon instanceof Cat);    // true
console.log(simon instanceof JClass); // true

console.log(simon.name);       // 'simon'
console.log(simon.__behave()); // TypeError: Object has no method '__behave'
console.log(simon.eat());      // 'simon behaves because simon eats fish'
console.log(simon.__lives);    // undefined
console.log(simon.getLives()); // 9
```
This little example shows only the basics. It's even possible to customize and optimize JClass for
the various needs of your code by using [`options`](https://github.com/riga/jclass#options) (e.g.
you can change the naming scheme of private members). Take a look at the [examples](https://github.com/riga/jclass#examples)
to get a picture of what is possible and how it's working.


## Installation

For node (using npm):

```console
npm install jclass
```

For web browsers:

```html
<script src="/path/to/jclass.min.js"></script>
```


## Examples

### Calling `_super` methods

```javascript
var Vehicle = JClass.extend({
    init: function(type) {
        this.type = type;
    },

    drive: function() {
        return 'driving';
    }
});

var Car = Vehicle.extend({
    init: function(color) {
        // call the super 'init'
        this._super('car');
        this.color = color;
    },

    drive: function() {
        // call the super 'drive'
        return this._super() + ' on 4 tires';
    }
});

var myCar = new Car('red');

console.log(myCar.drive()); // 'driving on 4 tires'
```

### Private members and the private object

```javascript
var Vehicle = JClass.extend({
    init: function(type, price) {
        this.type = type;

        // a private value, indicated by 2 leading underscores
        // because 'privatePattern' is /__.*/ by default
        this.__price = price

        // a private value using the 'private object'
        this.__.consumption = 'too much';
    },

    // a private method
    __drive: function() {
        return 'driving';
    }
});

var Car = Vehicle.extend({
    init: function(color, price) {
        this._super('car', price);
        this.color = color;
    },

    // a getter for 'this.__price'
    getPrice: function() {
        return this.__price;
    },

    forceDrive: function() {
        return this.__drive();
    }
});

var myCar = new Car('red', 10000);

console.log(myCar.__price);        // undefined
console.log(myCar.getPrice());     // 10000
console.log(myCar.__.consumption); // undefined
console.log(myCar.__drive());      // TypeError: Object has no method '__drive'
console.log(myCar.forceDrive());   // 'driving'
```

### Disable `tracking`

```javascript
var opts = {
    tracking: false
};

var Vehicle = JClass.extend({
    init: function(type, price) {
        this.type = type;

        // won't be private since there is no tracking
        this.__price = price
        
        // values of the 'private object' stay private though!
        this.__.consumption = 'too much';
    },

    // still a private method since tracking does not affect methods
    // (methods are kown before the first method call)
    __drive: function() {
        return 'driving';
    }
}, opts); // note the second parameter

var Car = Vehicle.extend({
    init: function(color, price) {
        this._super('car', price);
        this.color = color;
    },

    forceDrive: function() {
        return this.__drive();
    }
});

var myCar = new Car('red', 10000);

console.log(myCar.__price);      // 10000
console.log(myCar.__drive());    // TypeError: Object has no method '__drive'
console.log(myCar.forceDrive()); // 'driving'
```

### Final classes using `extendable`

```javascript
var opts = {
    extendable: false
};

var Vehicle = JClass.extend({
    init: function(type) {
        this.type = type;

        // a private value
        this.__secret = 'yay!';
    }

}, opts); // note the second parameter

var CarHack = Vehicle.extend({
    init: function() {
        this._super('car');
    },

    // try to get the '__secret'
    getSecret: function() {
        return this.__secret;
    }
});

// 'CarHack' won't be assigned since 'Vehicle' cannot be subclassed anymore
```

### Changing keys

```javascript
var opts = {
    ctorName      : 'ctor',         // the constructor name
    superName     : '_parent',      // the super method name
    privatePattern: '/^__.+__$/',   // the naming scheme
    privateName   : '_private'      // the name of the private object
};

var Vehicle = JClass.extend({
    ctor: function(type) {
        this.type = type;

        // a private value
        this.__secret__ = 'yay!';

        // a private value using the 'private object'
        this._private.foo = 'bar';
    },

    // a private method
    __drive__: function() {
        return 'driving';
    }
});

var Car = Vehicle.extend({
    ctor: function(color) {
        // call the super 'init'
        this._parent('car');
        this.color = color;
    },

    tellSecrets: function() {
        return this.__drive__() + ' ' + this.__secret__;
    }
});

var myCar = newCar('red');

console.log(myCar.tellSecrets()); // 'driving yay!'

```

## Configuration

### Options
The signature of `extend` is

```javascript
var SubClass = JClass.extend(properties [, options]);
```
* [`properties`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L101)
\- (Object, *mandatory*)
\- An object that defines the methods of your class. See [John Resig's Simple Inheritance](http://ejohn.org/blog/simple-javascript-inheritance/) technique for more details.

* [`options`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L101)
\- (Object, *optional*)
\- An object containing
    * [`extendable`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L345)
    \- (Boolean, *default:* **true**)
    \- When true, another subclass can inherit from this class. When false, this class cannot be
    subclassed (e.g. like [`final` classes in Java](http://en.wikipedia.org/wiki/Final_(Java))).

    * [`ctorName`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L335)
    \- (String, *default:* **'init'**)
    \- The name of the method that is invoked when a new instance of your class is created via
    `new MyClass()`. All passed arguments are applied to this method (OO speaking: the constructor's
    name).

    * [`superName`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L149)
    \- (String, *default:* **'\_super'**)
    \- The name of the methods of the super-class.
    When you call (e.g.) `this._super()` in your `init` method, the `init` method of the super-class
    is called.

    * [`enablePrivacy`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L109)
    \- (String, *default:* **true**)
    \- When false, this is equivalent to `privatePattern = null` plus `privateName = null` (see
    below).

    * [`privatePattern`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L307)
    \- (RegExp, *default:* **/^\_\_.+/**)
    \- A [regular expression](http://en.wikipedia.org/wiki/Regular_expression) that defines how your
    private members look like. `/^__.+/` would find `__fooFn` but not `_barFn`. Null means that
    there will be no private members.

    * [`privateName`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L155)
    \- (String, *default:* **'\_\_'**)
    \- In addition to values/methods that match the `privatePattern`, another private object named
    `privateName` is visible in every method's scope. In some cases, you may use this object instead
    of using `tracking` (see below). Null means that no additional private object will be used.

    * [`tracking`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L212)
    \- (Boolean, *default:* **true**)
    \- `tracking` means that all members of an instance are compared before and after a method call
    in order to track down any addition or deletion of private values (not methods!). When you call
    (e.g.) 'this.\_\_foo = 123' inside a method, the key `__foo` (that also matches the
    `privatePattern`) was obviously added and will be detected by the *before/after* comparison. If
    your classes have a lot of members, you should use the additional private object defined by
    `privateName` to reduce the number of comparisons. *Note*: when false, all non-methods (even if
    they match the 'privatePattern') won't be private (`this.__foo` in our example).

    * [`methodsKey`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L177)
    \- (String, *default:* **'\_jcMethods\_'**)
    \- The name of the object that holds all private methods during a method call. *Note*: you only
    need to change this value in case of a name collision with your code.

    * [`depthKey`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L124)
    \- (String, *default:* **'\_jcDepth\_'**)
    \- The name of the depth value (0 for JClass, 1 for the first derived class, 2 for the second
    ...). *Note*: you only need to change this value in case of a name collision with your code.

    * [`callerDepthKey`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L161)
    \- (String, *default:* **'\_jcCallerDepth\_'**)
    \- The name of the depth value of the initial caller. *Note*: you only need to change this value
    in case of a name collision with your code.

**Please note:** when extending an existing class, please use identical values for the options
`ctorName`, `superName`, `privatePattern` and `privateName` in order to keep the prototype/inheritence model
consistent!

#### `JClass.noConflict()`
Use this method when `JClass` interfers with your code. It returns a reference to the `JClass` base
object and resets the `JClass` variable to its initial value.


## Development

- Source hosted at [GitHub](https://github.com/riga/jclass)
- Report issues, questions, feature requests on
[GitHub Issues](https://github.com/riga/jclass/issues)


## Authors

Marcel R. ([riga](https://github.com/riga))
