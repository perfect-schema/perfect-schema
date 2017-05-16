/**
Boolean validation

Returns true if value is undefined, or a boolean. False otherwise.

@param options {Object}
@return {function}
*/
module.exports = function booleanValidator(options) {
  /**
  Validate the given value

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if (value !== undefined && typeof value !== 'boolean') {
      return 'invalidType';
    }
  };
};
