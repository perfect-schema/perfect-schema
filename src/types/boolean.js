/**
Boolean validation

Return a validator that will check if the value is a boolean.

@return {function}
*/
function booleanValidator() {
  /**
  Validate the given value if it is a boolean or undefined, and return the error message
  or undefined if validated.

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if (value !== undefined && typeof value !== 'boolean') {
      return 'invalidType';
    }
  };
}


module.exports = booleanValidator;
