const booleanValidator = require('./boolean');
const stringValidator = require('./string');
const integerValidator = require('./integer');
const numberValidator = require('./number');
const dateValidator = require('./date');
const objectValidator = require('./object');
const arrayValidator = require('./array');

const validators = {
  [Boolean]: booleanValidator,
  [String]: stringValidator,
  [integerValidator.Type]: integerValidator,
  [Number]: numberValidator,
  [Date]: dateValidator,
  [Object]: objectValidator,
  [Array]: arrayValidator
};
const typeMap = {
  'boolean': Boolean,
  'string': String,
  'integer': integerValidator.Type,
  'number': Number,
  'date': Date,
  'object': Object,
  'array': Array
};

validators.getType = function getType(type) {
  if (typeof type === 'string') {
    const typeKey = type.toLowerCase();

    if (typeKey in typeMap) {
      return typeMap[typeKey];
    } else {
      throw new TypeError('Unknown type name : ' + type);
    }
  }

  return type;
}


validators.isType = function isType(type) {
  return type && ((type in validators) || ((typeof type === 'string') && (type.toLowerCase() in typeMap)));
}


module.exports = validators;
