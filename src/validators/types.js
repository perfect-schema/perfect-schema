
/**
Type validation : make sure the field has a type set, and that it is valid according to the specs

@param field {string}         the field name
@param specs {object}         the field specs
@param validator {funciton}   the current validator (if any)
@return {function}
*/
function typeValidator(field, specs, validator) {
  var typeValidator;

  if ((typeof specs === 'string') || (specs in validators) || isSchema(specs)) {
    specs = { type: specs };
  }

  if (!specs || !specs.type) {
    console.log("*** ", field, specs, (specs in validators));
    throw new TypeError('Field type not set for ' + field);
  } else if (typeof specs.type === 'string') {
    const type = specs.type.toLowerCase();

    if (!(type in typeMap)) {
      throw new TypeError('Unknown type "' + specs.type + '" for ' + field);
    }

    // normalize field type
    specs.type = typeMap[type];
  } else if (specs.type instanceof Array) {
    specs.allowedTypes = specs.type;
    specs.type = anyValidator.Type;
  }

  if (isSchema(specs.type)) {
    typeValidator = schemaValidator(specs.type);
  } else if (!validators[specs.type]) {
    throw new TypeError('Unknown type for field ' + field);
  } else {
    typeValidator = validators[specs.type](field, specs);
  }

  /**
  Ensure that the value of the specified type.

  @param value {any}
  @param ctx {ValidationContext}
  @return {string|undefined}
  */
  return function isType(value, ctx) {
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
Return a proxy function, validating the given value against the specified schema.
*/
function schemaValidator(schema) {
  return function (value, ctx) {
    return schema.validate(value, ctx);
  };
}


module.exports = typeValidator;


const isSchema = require('../schema').isSchema;

const anyValidator = require('../types/any');
const booleanValidator = require('../types/boolean');
const stringValidator = require('../types/string');
const integerValidator = require('../types/integer');
const numberValidator = require('../types/number');
const dateValidator = require('../types/date');
const objectValidator = require('../types/object');
const arrayValidator = require('../types/array');

const validators = {
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
