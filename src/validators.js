/**
Build the validator for the given field

@param field {string}     the field name
@param specs {object}     the field specifications
@return {function}        the validator function chain
*/
function buildValidator(field, specs) {
  var validator = valid;
  var index, wrapper;

  for (index = validators.length - 1; index >= 0; --index) {
    wrapper = validators[index].wrapper;
    validator = wrapper(field, specs, validator);
  }

  return validator;
}


function isRegistered(wrapper) {
  for (var validator of validators) {
    if (validator.wrapper === wrapper) {
      return true;
    }
  }

  return false;
}


/**
Register a new validator. This validator will be added after the last validator, unless an
index is specified. Refer to the documentation to know the order of the built-in validators,
and what value this function expects. If the validator was already registered, it is ignored;
unregister the validator, first, before registering again.

@param validator {function}
@return {number}             the validator count
*/
function registerValidator(wrapper, index) {
  if (typeof wrapper !== 'function') {
    throw new TypeError('Validator must be a function');
  } else if (typeof wrapper(null, {}) !== 'function') {
    throw new TypeError('Validator must return a function');
  } else if (isRegistered(wrapper)) {
    throw new TypeError('Validator already registered');
  }

  if (arguments.length === 1) {
    index = validators[validators.length - 1].index + 1
  }

  validators.push({ wrapper: wrapper, index: index });
  validators.sort((a, b) => a.index - b.index);

  return validators.length;
}


/**
Unregister the given validator.

@param validator {function}
@return {number}             the validator count
*/
function unregisterValidator(wrapper) {
  for (var index = validators.length - 1; index >= 0; --index) {
    if (validators[index].wrapper === wrapper) {
      validators.splice(index, 1);
    }
  }

  return validators.length;
}



/**
A function that does nothing. Required as base validator by some wrappers
*/
function valid() {}


module.exports.build = buildValidator;
module.exports.registerValidator = registerValidator;
module.exports.unregisterValidator = unregisterValidator;


const validators = [
  { wrapper: require('./validators/required'), index: 0 },
  { wrapper: require('./validators/nullable'), index: 1 },
  { wrapper: require('./validators/types'), index: 10 },
  { wrapper: require('./validators/custom'), index: 100 }
];
