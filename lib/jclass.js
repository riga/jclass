/*!
 * JavaScript Inheritance with Private Members
 * Largely based upon John Resig's inheritance technique,
 * (see http://ejohn.org/blog/simple-javascript-inheritance/)
 * that was inspired by base2 and Prototype.
 *
 * Works with and without node.
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license
 *
 * v2.0.4, Marcel Rieger, 2013
 * https://github.com/riga/jclass
 * https://npmjs.org/package/jclass
 */

// first, we determine our namespace
var ns, nsKey;
// node? check some global node variables
if (typeof global !== 'undefined' && typeof process !== 'undefined' &&
    typeof module !== 'undefined' && module.exports) {
    ns    = module;
    nsKey = 'exports';
}
// browser/window?
else if (typeof window !== 'undefined') {
    ns    = window;
    nsKey = 'JClass';
}

(function(ns, nsKey) {

    // store the current namespace value to use it later on when 'noConflict' is called
    var _JClass = ns[nsKey];

    // define default options
    // when e.g. 'init' is used in the following comments, I'm of course referencing the value of
    // the 'ctor' option (and so on)
    // PLEASE NOTE:
    //      when extending an existing class, please use identical values for the options 'ctor',
    //      'super', 'privatePattern' and 'privateName' in order to keep the prototype/inheritence
    //      model consistent
    var defaultOpts = {

        // is the generated class extendable?
        extendable: true,

        // the name of the constructor function
        ctorName: 'init',

        // the name of the super function (if any) that is exposed in every method's scope
        superName: '_super',

        // when set to false, this is equivalent to 'privatePattern = null' plus 'privateName = null'
        enablePrivacy: true,

        // a regexp that defines the pattern of private members, e.g. /^__.+/ finds '__someFn' but
        // not '_someFn' or '__'
        // null -> don't use private members
        privatePattern: /^__.+/,

        // 'tracking' means that all members of an instance are compared before and after a method
        // call in order to track down any addition or deletion of private values (not methods!);
        // e.g. you call 'this.__foo = 123' inside a method, the key '__foo' (that also matches the
        // 'privatePattern') was obviously added and will be detected by a 'before/after'
        // comparison; if your classes have a lot of members, you should use the additional private
        // object defined by 'privateName'
        // note: when false, all non-methods (even if they match the 'privatePattern') won't be
        // private ('this.__foo' in our example)
        tracking: true,

        // in addition to values/methods that match the 'privatePattern', another private object is
        // visible in every method's scope; you may use this object instead of using 'tracking' since
        // it's faster
        // null -> don't use the private object
        privateName: '__',

        // the name of the object that contains all private methods and that only exists while
        // executing a method
        // Note: only change this value in case of a name collision with your code
        methodsKey: '_jcMethods_',

        // the name of the depth value (0 for JClass, 1 for the first derived class,
        // 2 for the second ...)
        // Note: only change this value in case of a name collision with your code
        depthKey: '_jcDepth_',

        // the name of the depth value of the initial caller
        // Note: only change this value in case of a name collision with your code
        callerDepthKey: '_jcCallerDepth_'
    };

    // 'initializing' is true as long the extend function creates a new prototype in order to lock
    // any instantiation of the inheriting class
    var initializing = false;

    // the empty base Class definition
    var JClass = function() {};

    // 'extend' will return a new constructor
    JClass.extend = function(props, opts) {
        // merge into default options
        opts = opts || {};
        for (var key in defaultOpts)
            if (opts[key] === undefined)
                opts[key] = defaultOpts[key];

        // check 'enablePrivacy'
        if (!opts.enablePrivacy) {
            opts.privatePattern = null;
            opts.privateName     = null;
        }

        // store our prototype
        var _super = this.prototype;

        // instantiate a base class without calling its 'init' function (which is granted by
        // toggling 'initializing')
        initializing = true;
        var prototype = new this();
        initializing = false;

        // set the depth of this class, 0 for JClass itself (see comments of 'opts.depthKey')
        prototype[opts.depthKey] = _super[opts.depthKey] || 0;
        prototype[opts.depthKey]++;
        // shortcut for this scope
        var depth = prototype[opts.depthKey];

        // private methods
        var _methods = {};

        // private non-methods
        var _values = {};

        // the additional private object
        var _private = {};

        // copy the properties over onto the new prototype
        for (var name in props) {
            // a function?
            if (props[name] instanceof Function) {
                var protoFn = (function(name, fn) {
                    return function() {
                        // temporarily expose the super function; private methods are not affected
                        // since '_super[name]' is undefined by design for any given 'name'
                        var tmpSuper = this[opts.superName];
                        // we don't want to overwrite private methods' super methods
                        if (!opts.privatePattern || !opts.privatePattern.test(name))
                            this[opts.superName] = _super[name];

                        // temporarily expose the private object
                        var tmpPrivate;
                        if (opts.privateName) {
                            tmpPrivate = this[opts.privateName];
                            this[opts.privateName] = tmpPrivate || _private;
                        }

                        var tmpMethods, tmpMethod, tmpValues, tmpKeys;
                        if (opts.privatePattern) {
                            // temporarily store the depth of the initial caller
                            if (this[opts.callerDepthKey] === undefined)
                                this[opts.callerDepthKey] = depth;

                            // since we can't simply apply the super function to private methods
                            // ('_super[name]' is always undefined, see above), we have to simulate
                            // prototypical behavior and that's why we introduced the 'depth' value;
                            // 'this[opts.methodsKey]' is used to pass all private methods to its
                            // super methods where they're stored according to their depth;
                            // e.g. { fooFn: { 1: [fn], 2: [fn], 3: [fn] }, barFn: ... }
                            // this structure provides a handle for mapping methods to their super
                            // methods (see the code for more info); at the end,
                            // 'this[opts.methodsKey]' is copied to '_methods' so that the algorithm
                            // only needs to run once (in the 'init' function) whereas the actual
                            // method exposing (using '_method') is done for every call
                            tmpMethods = this[opts.methodsKey];
                            if (name == opts.ctor) {
                                this[opts.methodsKey] = tmpMethods || _methods;
                                // run the algorithm for every private method
                                for (var _method in _methods) {
                                    // initialize
                                    if (!this[opts.methodsKey][_method])
                                        this[opts.methodsKey][_method] = {};
                                    this[opts.methodsKey][_method][depth] = _methods[_method][depth];
                                    // the target method we want to assign the super method to
                                    var target = this[opts.methodsKey][_method][depth];
                                    // create a new method that internally calls the old one
                                    this[opts.methodsKey][_method][depth] = function() {
                                        var tmp = this[opts.superName];
                                        // the super function is one level above (-1)
                                        this[opts.superName] = this[opts.methodsKey][_method][depth-1];
                                        var _ret = target.apply(this, arguments);
                                        this[opts.superName] = tmp;
                                        return _ret;
                                    };
                                }
                                // copy to '_methods'
                                _methods = this[opts.methodsKey];
                            } else {
                                this[opts.methodsKey] = _methods;
                            }
                            // method exposing happens here
                            tmpMethod = {};
                            for (var _method in this[opts.methodsKey]) {
                                tmpMethod[_method] = this[_method];
                                // the deepest method will be exposed which is the
                                // standard OO behavior
                                var max = Math.max.apply(Math, Object.keys(_methods[_method]));
                                this[_method] = _methods[_method][max];
                            }

                            // temporarily expose all private values (depends on 'tracking')
                            if (opts.tracking) {
                                tmpValues = {};
                                for (var key in _values) {
                                    tmpValues[key] = this[key];
                                    this[key] = _values[key];
                                }
                            }

                            // store all member's keys to compare them with the keys after the
                            // actual method execution (depends on 'tracking')
                            if (opts.tracking)
                                tmpKeys = Object.keys(this);
                        }

                        // call the actual function whose scope will contain the additional
                        // temporary objects
                        var ret = fn.apply(this, arguments);

                        if (opts.privatePattern) {
                            // the handling of private values (add, remove) depends on 'tracking'
                            if (opts.tracking) {
                                // check if new private values have been changed or removed (this
                                // works for functions as well but note that those functions won't
                                // have additional features (e.g. super))
                                var keys = Object.keys(this);
                                for (var key in keys) {
                                    key = keys[key];
                                    if (opts.privatePattern.test(key)) {
                                        // private value that may have been added or changed
                                        tmpValues[key] = this[key];
                                        _values[key] = this[key];
                                    }
                                }
                                for (var key in tmpKeys) {
                                    key = tmpKeys[key];
                                    var removed = keys.indexOf(key) < 0
                                        && opts.privatePattern.test(key);
                                    if (removed) {
                                        // a private value was removed
                                        delete _values[key];
                                        delete this[key];
                                    }
                                }

                                // reset all private values
                                for (var key in _values) {
                                    var cd = this[opts.callerDepthKey];
                                    if (tmpValues[key] === undefined || depth == cd)
                                        delete this[key];
                                    else
                                        this[key] = tmpValues[key];
                                }
                            }

                            // reset all private methods
                            for (var key in this[opts.methodsKey]) {
                                if (tmpMethod[key] === undefined)
                                    delete this[key];
                                else
                                    this[key] = tmpMethod[key];
                            }

                            // reset the private methods object
                            if (tmpMethods === undefined)
                                delete this[opts.methodsKey];
                            else
                                this[opts.methodsKey] = tmpMethods;

                            // reset the caller depth
                            if (depth == this[opts.callerDepthKey])
                                delete this[opts.callerDepthKey];
                        }

                        // reset the private object
                        if (opts.privateName) {
                            if (tmpPrivate === undefined)
                                delete this[opts.privateName];
                            else
                                this[opts.privateName] = tmpPrivate;
                        }

                        // reset the super method
                        if (tmpSuper === undefined)
                            delete this[opts.superName];
                        else
                            this[opts.superName] = tmpSuper;

                        // finally, return the result of the actual method
                        return ret;
                    };
                })(name, props[name]);

                // check if the method is private
                var isPrivate = opts.privatePattern && opts.privatePattern.test(name);
                if (isPrivate) {
                    // yes, store in _methods
                    _methods[name] = {};
                    _methods[name][depth] = protoFn;
                } else {
                    // no, add it to our prototype
                    prototype[name] = protoFn;
                }

            // not a function
            } else {
                // private value?
                var isPrivate = opts.tracking && opts.privatePattern
                    && opts.privatePattern.test(name)
                if (isPrivate)
                    // yes, store in in _values
                    _values[name] = props[name];
                else
                    // no, add it to our prototype
                    prototype[name] = props[name];
            }
        }

        // the actual base class
        function JClass() {
            // only call 'init' when 'new' is invoked outside the 'extend' method
            if (!initializing && this[opts.ctorName])
                this[opts.ctorName].apply(this, arguments);
        }

        // populate our constructed prototype object
        JClass.prototype = prototype;

        // enforce the constructor to be what we expect
        JClass.prototype.constructor = JClass;

        // try to make this class extendable
        if (opts.extendable !== false)
            JClass.extend = arguments.callee;

        return JClass;
    };

    // 'noConflict' will set reset the namespace value and return JClass
    JClass.noConflict = function() {
        var JClass_ = ns[nsKey];
        ns[nsKey]   = _JClass;
        return JClass_;
    };

    // add JClass to the namespace
    ns[nsKey] = JClass;

})(ns, nsKey);
