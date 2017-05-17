/**
String validation

Returns true if value is undefined, or a string. False otherwise.

Options:
 - min {Numeric}       string min length (inclusive)
 - max {Numeric}       string max length (inclusive)

@param options {Object}
@return {function}
*/
module.exports = function stringValidator(options) {
  /**
  Validate the given value

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if (typeof value === 'string') {
      const min = 'min' in options ? options.min : -Infinity;
      const max = 'max' in options ? options.max : Infinity;

      if (value.length < min) {
        return 'minString';
      } else if (value.length > max) {
        return 'maxString';
      }
    } else if (value !== undefined) {
      return 'invalidType';
    }
  };
};
