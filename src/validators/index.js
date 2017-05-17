const booleanValidator = require('./boolean');
const stringValidator = require('./string');
const integerValidator = require('./integer');
const numberValidator = require('./number');
const dateValidator = require('./date');
const objectValidator = require('./object');
const arrayValidator = require('./array');

module.exports = {
  [Boolean]: booleanValidator,
  'boolean': booleanValidator,
  [String]: stringValidator,
  'string': stringValidator,
  [integerValidator.Type]: integerValidator,
  'integer': integerValidator,
  [Number]: numberValidator,
  'number': numberValidator,
  [Date]: dateValidator,
  'date': dateValidator,
  [Object]: objectValidator,
  'object': objectValidator,
  [Array]: arrayValidator,
  'array': arrayValidator
};
