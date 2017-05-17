/**
Number validation

Returns true if value is undefined, or a number. False otherwise.

Options:
 - min {Numeric}       min value (inclusive)
 - max {Numeric}       max value (exclusive)

@param options {Object}
@return {function}
*/
module.exports = function numberValidator(options) {
  /**
  Validate the given value

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if ((typeof value == 'number') && (value === value) && isFinite(value)) {
      const min = 'min' in options ? options.min : -Infinity;
      const max = 'max' in options ? options.max : Infinity;

      if (value < min) {
        return 'minNumber';
      } else if (value > max) {
        return 'maxNumber';
      }
    } else if (value !== undefined) {
      return 'invalidType';
    }
  };
};
