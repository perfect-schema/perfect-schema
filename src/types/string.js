/**
String validation

Return a validator that will check if the value is a string.

Options:
 - min {Numeric}       string min length (inclusive)
 - max {Numeric}       string max length (inclusive)

@oaram field {string}
@param specs {Object}
@return {function}
*/
function stringValidator(field, specs) {
  const min = 'min' in specs ? specs.min : -Infinity;
  const max = 'max' in specs ? specs.max : Infinity;

  /**
  Validate the given value if it is a plain object or undefined, and return the error message
  or undefined if validated.

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if (typeof value === 'string') {
      if (value.length < min) {
        return 'minString';
      } else if (value.length > max) {
        return 'maxString';
      }
    } else if (value !== undefined) {
      return 'invalidType';
    }
  };
}


module.exports = stringValidator;
