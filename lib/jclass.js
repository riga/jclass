/*!
 * JavaScript Inheritance with Private Members
 * Largely based upon John Resig's inheritance technique,
 * (see http://ejohn.org/blog/simple-javascript-inheritance/)
 * that was inspired by base2 and Prototype.
 *
 * Works with AND without node.
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license
 *
 * Marcel Rieger, 2013
 */

// 'initializing' is true as long the extend function creates a new prototype
// in order to lock any instantiation of the inheriting class
var initializing = false;

// a nifty regexp to check for correct function decompilation
var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

// the empty base Class definition
var Class = function() {};

// 'extend' will return a new constructor
Class.extend = function(prop, extendable) {
    // store the present prototype
    var _super = this.prototype;

    // instantiate a base class without calling its 'init' function which is
    // granted by toggling 'initializing'
    initializing = true;
    var prototype = new this();
    initializing = false;

    // create a new private object
    var _private = new Object();

    // create a private method store
    var _methods = new Object();

    // copy the properties over onto the new prototype
    for (var name in prop) {
        if (prop[name] instanceof Function) {
            var protoFn = (function(name, fn) {
                return function() {
                    // temporarily expose the super function to every member in
                    // 'prop' as 'this._super'
                    var tmpS = this._super;
                    this._super = _super[name];
                    // temporarily expose the private object as 'this._private'
                    var tmpP = this._private;
                    this._private = this._private || _private;
                    // temporarily expose the private methods as 'this._methods'
                    var tmpM = this._methods;
                    // we need to extend 'this._methods' by all values of
                    // '_methods' to simulate inheritance
                    this._methods = this._methods || _methods;
                    for (var _method in _methods) {
                        this._methods[_method] = this._methods[_method] || _methods[_method];
                    }
                    // exposing happens here
                    for (var _method in this._methods) {
                        this[_method] = this._methods[_method];
                    }

                    // call the actual function whose scope contains the two
                    // temporary objects
                    var ret = fn.apply(this, arguments);

                    // reset all private methods
                    for (var _method in _methods) {
                        delete this[_method];
                    }
                    // reset 'this._methods'
                    this._methods = tmpM;
                    // propper cleanup
                    if (this._methods === undefined) {
                        delete this._methods;
                    }
                    // reset 'this._super'
                    this._super = tmpS;
                    // propper cleanup
                    if (this._super === undefined) {
                        delete this._super;
                    }
                    // reset 'this._private' when we're not in our 'init'
                    // function (see below)
                    this._private = tmpP;
                    // propper cleanup
                    if (this._private === undefined) {
                        delete this._private;
                    }

                    return ret;
                };
            })(name, prop[name]);

            // methods can also be private
            if (/^__/.test(name)) {
                _methods[name] = protoFn;
            } else {
                prototype[name] = protoFn;
            }
        }

    }

    // the actual base class
    function Class() {
        // only call 'init' when 'new' is invoked outside the 'extend' method
        if (!initializing && this.init) {
            this.init.apply(this, arguments);
        }
    }

    // populate our constructed prototype object
    Class.prototype = prototype;

    // enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // try to make this class extendable
    if (extendable !== false) {
        Class.extend = arguments.callee;
    }

    return Class;
};

// export if we're in a node environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Class;
}
