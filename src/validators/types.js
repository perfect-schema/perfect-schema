
/**
Type validation : make sure the field has a type set, and that it is valid according to the specs

@param field {string}         the field name
@param specs {object}         the field specs
@param validator {funciton}   the current validator (if any)
@return {function}
*/
function typeValidator(field, specs, validator) {
  var typeValidator;

  specs = specs || {};

  if (typeof specs === 'string') {
    specs = { type: typeMap[specs] || getUserType(specs) };
  } else if (typeof specs.type === 'string') {
    specs.type = typeMap[specs.type] || getUserType(specs.type);
  } else if (specs instanceof Array) {
    if (!specs.length) {
      throw new TypeError('Missing element types for typed array');
    } else if (specs.length === 1) {
      specs = { type: Array, elementType: specs[0] };
    } else {
      specs = { type: Array, elementType: { type: anyValidator.Type, allowedTypes: specs } };
    }
  } else if (specs.type instanceof Array) {
    if (!specs.type.length) {
      throw new TypeError('Missing element types for typed array');
    } else if (specs.type.length === 1) {
      specs = { type: Array, elementType: specs.type[0] };
    } else {
      specs = { type: Array, elementType: { type: anyValidator.Type, allowedTypes: specs.type } };
    }
    specs.type = Array;
  } else if (!('type' in specs)) {
    specs = { type: specs };
  }

  if (specs.type in types) {
    typeValidator = types[specs.type](field, specs);
  } else if (isUserType(specs.type)) {
    typeValidator = getUserTypeValidator(specs.type)(field, specs);
  } else {
    throw new TypeError('Field type not set or unknown for ' + field);
  }

  /**
  Ensure that the value of the specified type.

  @param value {any}
  @param ctx {ValidationContext}
  @return {string|undefined}
  */
  return function type(value, ctx) {
    const result = typeValidator(value, ctx);

    if (typeof result === 'string') {
      return result;
    } else if (result instanceof Promise) {
      return result.then(message => {
        if (typeof message === 'string') {
          return message;
        } else {
          return validator(value, ctx)
        }
      });
    } else {
      return validator(value, ctx);
    }
  };
}


/**
Register a new user-defined type. The type should be a constructor function.

@param type {Object|function} a constructor function or an object
@param validator {function}   a function to validate a given value
@param aliases {Array}        a list of strings that maps to the given type
*/
function registerType(type, validator, aliases) {
  if (!type || (typeof type !== 'object')) {
    throw new TypeError('Invalid type value');
  } else if (typeof validator !== 'function') {
    throw new TypeError('Validator must be a function');
  } else if (typeof validator(null, {}) !== 'function') {
    throw new TypeError('Validator must return a function');
  }

  if (isUserType(type)) {
    throw new TypeError('Type already registered');
  }

  const userTypeIndex = userTypes.length;

  if ((aliases !== undefined) && !(aliases instanceof Array)) {
    throw new TypeError('Aliases must be an array');
  } else if (aliases && aliases.length) {
    for (var alias of aliases) {
      if (typeof alias !== 'string') {
        throw new TypeError('Alias for user type must be a string');
      } else if (!alias.length) {
        throw new TypeError('Alias cannot be empty');
      } else if (isUserType(alias) && (getUserType(alias) !== type)) {
        throw new TypeError('Alias already defined : ' + alias);
      }
    }

    for (var alias of aliases) {
      userTypeMap[alias] = userTypeIndex;
    }
  }

  userTypes.push({
    type: type,
    validator: validator
  });
}


/**
Unregister a specific type.

@param type {function}        a constructor function
*/
function unregisterType(type) {
  var aliases = Object.keys(userTypeMap);

  for (var alias of aliases) {
    if (getUserType(alias) === type) {
      delete userTypeMap[alias];
    }
  }

  for (var i = userTypes.length - 1; i >= 0; --i) {
    if (userTypes[i].type === type) {
      userTypes.splice(i, 1);
    }
  }
}


/**
Returns true if the given type (or type alias) is a registered user type

@param type {String|Object}
@return {boolean}
*/
function isUserType(type) {
  if (typeof type === 'string') {
    const userTypeIndex = userTypeMap[type];

    return !!userTypes[userTypeIndex];
  }

  for (var i = 0, len = userTypes.length; i < len; ++i) {
    if (userTypes[i].type === type) {
      return true;
    }
  }

  return false;
}


/**
Return the given user type. This function is useful to return the
actual user type if the specified value is a recognized alias. If
the value is not an alias and is not a string, it will be returned
as is.

@param type {String|any}
@param {Object|any}
*/
function getUserType(type) {
  if (typeof type === 'string') {
    const userTypeIndex = userTypeMap[type];
    const userType = userTypes[userTypeIndex];

    return userType && userType.type;
  }

  return type;
}


function getUserTypeValidator(type) {
  type = getUserType(type);

  for (var i = 0, len = userTypes.length; i < len; ++i) {
    if (userTypes[i].type === type) {
      return userTypes[i].validator;
    }
  }
}


module.exports = typeValidator;
module.exports.registerType = registerType;
module.exports.unregisterType = unregisterType;
module.exports.isRegisteredType = isUserType;
module.exports.getRegisteredType = getUserType;


const anyValidator = require('../types/any');
const booleanValidator = require('../types/boolean');
const stringValidator = require('../types/string');
const integerValidator = require('../types/integer');
const numberValidator = require('../types/number');
const dateValidator = require('../types/date');
const objectValidator = require('../types/object');
const arrayValidator = require('../types/array');

const types = {
  [anyValidator.Type]: anyValidator,
  [Array]: arrayValidator,
  [Boolean]: booleanValidator,
  [Date]: dateValidator,
  [integerValidator.Type]: integerValidator,
  [Number]: numberValidator,
  [Object]: objectValidator,
  [String]: stringValidator
};
const typeMap = {
  'any': anyValidator.Type,
  'array': Array,
  'bool': Boolean,
  'boolean': Boolean,
  'date': Date,
  'float': Number,
  'int': integerValidator.Type,
  'integer': integerValidator.Type,
  'number': Number,
  'object': Object,
  'string': String
};

const userTypes = [];
const userTypeMap = {};
