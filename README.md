# **jclass**

*Advanced JavaScript Inheritance with __private members__ based on [John Resig's Inheritance Class](http://ejohn.org/blog/simple-javascript-inheritance/)*

https://npmjs.org/package/jclass


## Synopsis

TODO


## Installation

For node (using npm):

```console
npm install jclass
```

For web browsers:

```javascript
<script src="/path/to/jclass.min.js"></script>
```


## Examples

TODO


## Configuration

### Options
The signature of `extend` is

```javascript
var SubClass = JClass.extend(properties [, options]);
```
* [`properties`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L101)
\- (Object, *mandatory*)
\- An object that defines the methods of your class. See [John Resig's Simple Inheritance]
(http://ejohn.org/blog/simple-javascript-inheritance/) technique for more details.

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
    \- (RegExp, *default:* **/\_\_.+/**)
    \- A [regular expression](http://en.wikipedia.org/wiki/Regular_expression) that defines how your
    private members look like. /\_\_.+/` would find `__fooFn` but not `_barFn`. Null means that
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
    \- (String, *default:* **'\_\_jcMethods\_\_'**)
    \- The name of the object that holds all private methods during a method call. *Note*: you only
    need to change this value in case of a name collision with your code.

    * [`depthKey`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L124)
    \- (String, *default:* **'\_\_jcDepth\_\_'**)
    \- The name of the depth value (0 for JClass, 1 for the first derived class, 2 for the second
    ...). *Note*: you only need to change this value in case of a name collision with your code.

    * [`callerDepthKey`](https://github.com/riga/jclass/blob/master/lib/jclass.js#L161)
    \- (String, *default:* **'\_\_jcCallerDepth\_\_'**)
    \- The name of the depth value of the initial caller. *Note*: you only need to change this value
    in case of a name collision with your code.

**Please note:** when extending an existing class, please use identical values for the options
`ctor`, `super`, `privatePattern` and `privateName` in order to keep the prototype/inheritence model
consistent!

### `JClass.noConflict()`
Use this method when `JClass` interfers with your code. It returns a reference to the `JClass` base
object and resets the `JClass` variable to its initial value.


## Development

- Source hosted at [GitHub](https://github.com/riga/jclass)
- Report issues, questions, feature requests on
[GitHub Issues](https://github.com/riga/jclass/issues)


## Authors

Marcel R. ([riga](https://github.com/riga))
