/**
Array validation

Return a validator that will check if the value is an array.

Options:
 - min {Numeric}                  min array length (inclusive)
 - max {Numeric}                  max array length (inclusive)

@oaram field {string}
@param specs {Object}    the field specs
@return {function}
*/
function arrayValidator(field, specs) {
  const min = 'min' in specs ? specs.min : -Infinity;
  const max = 'max' in specs ? specs.max : Infinity;

  /**
  Validate the given value if it is an array or undefined, and return the error message
  or undefined if validated.

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if (Array.isArray(value)) {
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
}


module.exports = arrayValidator;
