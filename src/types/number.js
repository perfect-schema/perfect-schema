/**
Number validation

Return a validator that will check if the value is a number.

Options:
 - min {Numeric}       min value (inclusive)
 - max {Numeric}       max value (exclusive)

@oaram field {string}
@param specs {Object}
@return {function}
*/
function numberValidator(field, specs) {
  const min = 'min' in specs ? specs.min : -Infinity;
  const max = 'max' in specs ? specs.max : Infinity;

  /**
  Validate the given value if it is a number or undefined, and return the error message
  or undefined if validated.

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if ((typeof value == 'number') && (value === value) && isFinite(value)) {
      if (value < min) {
        return 'minNumber';
      } else if (value > max) {
        return 'maxNumber';
      }
    } else if (value !== undefined) {
      return 'invalidType';
    }
  };
}


module.exports = numberValidator;
