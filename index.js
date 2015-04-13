/**
 * jclass v1.1.4
 * https://github.com/riga/jclass
 *
 * Marcel Rieger, 2015
 * MIT licensed, http://www.opensource.org/licenses/mit-license
 */

(function(factory) {

  /**
   * Make jclass available in any context.
   */

  if (typeof(define) == "function" && define.amd) {
    // AMD
    define([], factory);

  } else if (typeof(exports) == "object") {
    // CommonJS
    exports = factory();

    if (typeof module === "object") {
      // NodeJS
      module.exports = exports;
    }

  } else if (window) {
    // Browser
    window.JClass = factory();

  } else if (typeof(console) == "object" && console.error instanceof Function) {
    // error case
    console.error("cannot determine environment");
  }

})(function() {

  /**
   * Helper functions.
   */

  /**
   * Checks whether a passed object is a function.
   *
   * @param obj - The object to check.
   * @returns {boolean}
   */
  var isFn = function(obj) {
    return obj instanceof Function;
  };

  /**
   * Checks whether a passed object is a descriptor.
   *
   * @param obj - The object to check.
   * @returns {boolean}
   */
  var isDescr = function(obj) {
    // object check and strict boolean comparison of "descriptor" attribute
    return typeof(obj) == "object" && obj.descriptor === true;
  };

  /**
   * Extends a target object by one or more source objects with shallow key comparisons. Note that
   * the extension is done in-place.
   *
   * @param {object} target - The target object to extend.
   * @param {...object} source - Source objects.
   * @returns {object} The extended object.
   */
  var extend = function(target) {
    var sources = Array.prototype.slice.call(arguments, 1);

    // loop through all sources
    for (var i in sources) {
      var source = sources[i];

      // object check
      if (typeof(source) != "object") {
        continue;
      }

      // loop through all source attributes
      for (var key in source) {
        target[key] = source[key];
      }
    }

    return target;
  };


  /**
   * Default options.
   */

  var defaultOptions = {
    // internal object for indicating that class objects don't have a class object themselves,
    // may not be used by users
    _isClassObject: false
  };


  /**
   * Flags.
   */

  // flag to distinguish between prototype and class instantiation 
  var initializing = false;


  /**
   * Base class definition.
   */

  // empty BaseClass implementation
  var BaseClass = function(){};

  // add the _subClasses entry
  BaseClass._subClasses = [];


  /**
   * Extend mechanism. Returns a derived class.
   *
   * @param {object} instanceMembers - Members that will be owned by instances.
   * @param {object} classMembers - Members that will be owned by the class itself.
   * @returns {JClass}
   */
  BaseClass._extend = function(instanceMembers, classMembers, options) {

    // default arguments
    if (instanceMembers === undefined) {
      instanceMembers = {};
    }
    if (classMembers === undefined) {
      classMembers = {};
    }
    if (options === undefined) {
      options = {};
    }

    // mixin default options
    options = extend({}, defaultOptions, options);


    // sub class dummy constructor
    var JClass = function() {
      // nothing happens here when we are initializing
      if (initializing) {
        return;
      }

      // store a reference to the class itself
      this._class = JClass;

      // all construction is actually done in the init method
      if (this.init instanceof Function) {
        this.init.apply(this, arguments);
      }
    };


    // alias for readability
    var SuperClass = this;

    // create an instance of the super class via new
    // the flag sandwich prevents a call to the init method
    initializing = true;
    var prototype = new SuperClass();
    initializing = false;

    // get the prototype of the super class
    var superPrototype = SuperClass.prototype;

    // the instance of the super class is our new prototype
    JClass.prototype = prototype;

    // enforce the constructor to be what we expect
    // calls to the constructor will invoke the init method (see above)
    JClass.prototype.constructor = JClass;

    // store a reference to the super class
    JClass._superClass = SuperClass;

    // store references to all extending classes
    JClass._subClasses = [];
    SuperClass._subClasses.push(JClass);

    // make this class extendable as well
    JClass._extend = SuperClass._extend;


    // _extends returns true if the class itself extended "target"
    // in any hierarchy, e.g. every class extends "JClass" itself
    JClass._extends = function(target) {
      // this function operates recursive, so stop when the super class is our BaseClass
      if (this._superClass == BaseClass) {
        return false;
      }

      // success case
      if (target == this._superClass || target == BaseClass) {
        return true;
      }

      // continue with the next super class
      return this._superClass._extends(target);
    };


    // propagate instance members directly to the created protoype,
    // the member is either a normal member or a descriptor
    for (var key in instanceMembers) {
      var member = instanceMembers[key];

      if (isDescr(member)) {
        // descriptor -> define the property
        Object.defineProperty(prototype, key, member);

      } else {
        // normal member -> simple assignment
        prototype[key] = member;

        // if both member and the super member are distinct functions
        // add the super member to the member as "_super"
        var superMember = superPrototype[key];
        if (isFn(member) && isFn(superMember) && member !== superMember) {
          member._super = superMember;
        }
      }
    }


    // propagate class members to the _members object
    if (!options._isClassObject) {
      // try to find the super class of the _members object 
      var ClassMembersSuperClass = SuperClass._members === undefined ?
        BaseClass : SuperClass._members._class;

      // create the actual class of the _members instance
      // with an updated version of our options
      var opts = extend({}, options, { _isClassObject: true });
      var ClassMembersClass = ClassMembersSuperClass._extend(classMembers, {}, opts);

      // create the _members instance
      JClass._members = new ClassMembersClass();
    }


    // return the new class
    return JClass;
  };


  /**
   * Converts arbitrary protoype-style classes to our JClass definition.
   *
   * @param {function} cls - The class to convert.
   * @returns {JClass}
   */
  BaseClass._convert = function(cls, options) {
    return BaseClass._extend(cls.prototype, {}, options);
  };


  /**
   * Returns an instance of a class with a list of arguments. This provides an apply-like
   * constructor usage. Note that this approach does not work with native constructors (e.g. String
   * or Boolean).
   *
   * @param {Class|JClass} cls - The class to instantiate. This may be a JClass or a prototype-based
   *   class.
   * @param {array} [args=[]] - Arguments to pass to the constructor.
   * @returns {instance}
   */
  BaseClass._construct = function(cls, args) {
    // empty default args
    if (args === undefined) {
      args = [];
    }

    // create a class wrapper that calls cls like a function
    var Class = function() {
      return cls.apply(this, args);
    };

    // copy the prototype
    Class.prototype = cls.prototype;

    // return a new instance
    return new Class();
  };


  /**
   * Return the BaseClass.
   */

  return BaseClass;
});
