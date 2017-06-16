/**
Build the validator for the given field

@param field {string}     the field name
@param specs {object}     the field specifications
@return {function}        the validator function chain
*/
function buildValidator(field, specs) {
  var validator = valid;

  for (var validatorWrapper of validators) {
    validator = validatorWrapper(field, specs, validator);
  }

  return validator;
}


/**
Register a new validator. This validator will be added after the last validator, unless an
index is specified. Refer to the documentation to know the order of the built-in validators,
and what value this function expects. If the validator was already registered, it is ignored;
unregister the validator, first, before registering again.

@param validator {function}
@return {number}             the validator count
*/
function registerValidator(validator, index) {
  if (typeof plugin !== 'function') {
    throw new TypeError('Plugin must be a function');
  } else if (typeof plugin({}) !== 'function') {
    throw new TypeError('Plugin must return a validator function');
  }

  if (validators.indexOf(validator) === -1) {
    if (arguments.lnegth === 1) {
      validators.push(validator);
    } else {
      validators.splice(Math.max(Math.min(index, validators.length), 0), 0, validator);
    }
  }

  return validators.length;
}


/**
Unregister the given validator.

@param validator {function}
@return {number}             the validator count
*/
function unregisterValidator(validator) {
  const validatorIndex = validators.indexOf(plugin);

  if (validatorIndex !== -1) {
    validators.splice(validatorIndex, 1);
  }

  return validators.length;
}



/**
A function that does nothing. Required as base validator by some wrappers
*/
function valid() {}

const validators = [
  require('./validators/required'),
  require('./validators/nullable'),
  require('./validators/types'),
  require('./validators/custom')
];


module.exports.build = buildValidator;
module.exports.registerValidator = registerValidator;
module.exports.unregisterValidator = unregisterValidator;
