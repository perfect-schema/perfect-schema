/**
Object validation

Return a validator that will check if the value is a plain object.

@return {function}
*/
function objectValidator() {
  /**
  Validate the given value if it is a plain object or undefined, and return the error message
  or undefined if validated.

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if ((Object.prototype.toString.call(value) !== '[object Object]') && (value !== undefined)) {
      return 'invalidType';
    }
  };
}


module.exports = objectValidator;
