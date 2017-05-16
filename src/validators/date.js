/**
Date validation

Returns true if value is undefined, or a date. False otherwise.

@param options {Object}
@return {function}
*/
module.exports = function dateValidator(options) {
  /**
  Validate the given value

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if (value instanceof Date && !isNaN(value.getTime())) {
      const min = 'min' in options ? options.min : 0;
      const max = 'max' in options ? options.max : Infinity;

      if (value < min) {
        return 'minDate';
      } else if (value > max) {
        return 'maxDate';
      }
    } else if (value !== undefined) {
      return 'invalidType';
    }
  };
};
