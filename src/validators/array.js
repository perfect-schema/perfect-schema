/**
Array validation

Returns true if value is undefined, or an array. False otherwise.
If elementType is specified, then each array element will be tested
against this validator.

Options:
 - min {Numeric}                  min array length (inclusive)
 - max {Numeric}                  max array length (inclusive)

@param options {Object}
@return {function}
*/
module.exports = function arrayValidator(options) {
  /**
  Validate the given value

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if (Array.isArray(value)) {
      const min = 'min' in options ? options.min : -Infinity;
      const max = 'max' in options ? options.max : Infinity;
      const len = value.length;

      if (len < min) {
        return 'minArray';
      } else if (len > max) {
        return 'maxArray';
      }
    } else if (value !== undefined) {
      return 'invalidType';
    }
  };
};
