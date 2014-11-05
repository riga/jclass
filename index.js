/*!
 * jclass v1.1.2
 * https://github.com/riga/jclass
 *
 * Marcel Rieger, 2014
 * MIT licensed, http://www.opensource.org/licenses/mit-license
 */

(function(factory) {
  if (typeof define === "function" && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof exports === "object") {
    // CommonJS
    exports = factory();
    if (typeof module === "object") {
      // nodejs
      module.exports = exports;
    }
  } else if (window) {
    // Browser
    window.Class = factory();
  } else if (typeof console === "object" && console.error instanceof Function) {
    // error case
    console.error("cannot determine environment");
  }

})(function() {

  // helpers
  var isFn = function(obj) {
    return obj instanceof Function;
  };
  var isUndef = function(obj) {
    return obj === undefined;
  };
  var isObj = function(obj) {
    return typeof obj === "object";
  };
  var isDescr = function(obj) {
    return isObj(obj) && obj.descriptor === true;
  };
  var extend = function(target) {
    var objs = Array.prototype.slice.call(arguments, 1);
    var i, obj, key, originalValue;
    for (i in objs) {
      obj = objs[i];
      if (!isObj(obj)) return;
      for (key in obj) {
        originalValue = target[key];
        if (isUndef(originalValue)) target[key] = obj[key];
      }
    }
    return target;
  };

  // default options
  var defaultOptions = {
    _isClassObject: false
  };

  // flag to distinguish between prototype and class instantiation 
  var initializing = false;

  // empty BaseClass implementation
  var BaseClass = function(){};

  // add the _subClasses entry
  BaseClass._subClasses = [];

  // extend mechanism
  BaseClass._extend = function(instanceMembers, classMembers, options) {

    // default arguments
    if (isUndef(instanceMembers)) instanceMembers = {};
    if (isUndef(classMembers))    classMembers    = {};
    if (isUndef(options))         options         = {};

    // mixin default options
    extend(options, defaultOptions);

    // alias for readability
    var SuperClass = this;

    // sub class dummy constructor
    var Class = function() {
      // nothing happens here when we are initializing
      if (initializing) return;

      // store a reference to the class itself
      this._class = Class;

      // all construction is actually done in the init method
      if (this.init) this.init.apply(this, arguments);
    };

    // create an instance of the super class via new
    // the flag sandwich prevents a call to the init method
    initializing = true;
    var prototype = new SuperClass();
    initializing = false;

    // get the prototype of the super class
    var superPrototype = SuperClass.prototype;

    // the instance of the super class is our new prototype
    Class.prototype = prototype;

    // enforce the constructor to be what we expect
    // this will invoke the init method (see above)
    Class.prototype.constructor = Class;

    // store a reference to the super class
    Class._superClass = SuperClass;

    // store references to all extending classes
    Class._subClasses = [];
    SuperClass._subClasses.push(Class);

    // make this class extendable
    Class._extend = SuperClass._extend;

    // propagate instance members directly to the created protoype
    // the member is either a normal member or a descriptor
    var key, member, superMember;
    for (key in instanceMembers) {
      member = instanceMembers[key];

      if (isDescr(member)) {
        // descriptor -> define the property
        Object.defineProperty(prototype, key, member);

      } else {
        // normal member -> simple assignment
        prototype[key] = member;

        // if both member and the super member are distinct functions
        // add the super member to the member as "_super"
        superMember = superPrototype[key];
        if (isFn(member) && isFn(superMember) && member !== superMember) {
          member._super = superMember;
        }
      }
    }

    // propagate class members to the _members instance
    if (!options._isClassObject) {
      // find the super class of the _members instance 
      var ClassMembersSuperClass = isUndef(SuperClass._members) ?
        BaseClass : SuperClass._members._class;

      // create the actual class of the _members instance
      var opts = { _isClassObject: true };
      var ClassMembersClass = ClassMembersSuperClass._extend(classMembers, {}, opts);

      // create the instance
      Class._members = new ClassMembersClass();
    }

    // _extends returns true if the class itself extended "target"
    // in any hierarchy, e.g. every class inherits "Class" itself
    Class._extends = function(target) {
      if (this._superClass == BaseClass) return false;
      if (target == this._superClass || target == BaseClass) return true;
      return this._superClass._extends(target);
    };

    return Class;
  };


  // converts arbitrary protoype-style classes to our Class definition
  BaseClass._convert = function(cls, options) {

    // the properties consist of the class' prototype
    var instanceMembers = cls.prototype;

    // add the constructor function
    instanceMembers.init = function() {
      // simply create an instance of our target class
      this._origin = BaseClass._construct(cls, arguments);
    };

    // finally, create and return our new class
    return BaseClass._extend(instanceMembers, {}, options);
  };


  // returns an instance of a class with a list of arguments
  // that are passed to the constructor 
  // this provides an apply-like constructor usage
  BaseClass._construct = function(cls, args) {
    var Class = function() {
      return cls.apply(this, args || []);
    };

    Class.prototype = cls.prototype;

    return new Class();
  };

  return BaseClass;
});
