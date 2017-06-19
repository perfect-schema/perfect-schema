
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
    specs = { type: typeMap[specs] || userTypeMap[specs] };
  } else if (typeof specs.type === 'string') {
    specs.type = typeMap[specs.type] || userTypeMap[specs.type];
  } else if (specs instanceof Array) {
    specs = { type: Array, elementType: specs };
  } else if (specs.type instanceof Array) {
    specs.elementType = specs.type;
    specs.type = Array;
  } else if (!('type' in specs)) {
    specs = { type: specs };
  }

  if (specs.type in types) {
    typeValidator = types[specs.type](field, specs);
  } else if (specs.type in userTypes) {
    typeValidator = userTypes[specs.type](field, specs);
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
  if (!type || ((typeof type !== 'object') && (typeof type !== 'function'))) {
    throw new TypeError('Invalid type value');
  } else if (typeof validator !== 'function') {
    throw new TypeError('Validator must be a function');
  } else if (typeof validator(null, {}) !== 'function') {
    throw new TypeError('Validator must return a function');
  }

  userTypes[type] = validator;

  if (arguments.length >= 3) {
    if (!(aliases instanceof Array)) {
      throw new TypeError('Aliases must be an array');
    }

    if (aliases.length) {
      for (var alias of aliases) {
        if (typeof alias !== 'string') {
          throw new TypeError('Alias for user type must be a string');
        } else if (!alias.length) {
          throw new TypeError('Alias cannot be empty');
        } else if (alias in userTypeMap && (userTypeMap[alias] !== type)) {
          throw new TypeError('Alias already defined : ' + alias);
        }

        userTypeMap[alias] = type;
      }
    }
  }
}


/**
Unregister a specific type.

@param type {function}        a constructor function
*/
function unregisterType(type) {
  var aliases = Object.keys(userTypeMap);

  for (var alias of aliases) {
    if (userTypeMap[alias] === type) {
      delete userTypeMap[alias];
    }
  }

  delete userTypes[type];
}


module.exports = typeValidator;
module.exports.registerType = registerType;
module.exports.unregisterType = unregisterType;


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

const userTypes = {};
const userTypeMap = {};
