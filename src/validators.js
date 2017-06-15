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



function registerValidator(validator, index) {

}

function unregisterValidator(validator) {

}



/**
A function that does nothing. Required as base validator by some wrappers
*/
function valid() {}

const validators = [
  require('./validators/required'),
  require('./validators/nullable');
  require('./validators/types'),
  require('./validators/custom')
];


module.exports.build = buildValidator;
module.exports.registerValidator = registerValidator;
module.exports.unregisterValidator = unregisterValidator;
