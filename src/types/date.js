/**
Date validation

Return a validator that will check if the value is a Date object.

Options:
 - min {Numeric}       min date (inclusive)
 - max {Numeric}       max date (inclusive)

@oaram field {string}
@param specs {Object}
@return {function}
*/
function dateValidator(field, specs) {
  const min = 'min' in specs ? specs.min : 0;
  const max = 'max' in specs ? specs.max : Infinity;

  /**
  Validate the given value if it is a Date instance or undefined, and return the error message
  or undefined if validated.

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if (value instanceof Date && !isNaN(value.getTime())) {
      if (value < min) {
        return 'minDate';
      } else if (value > max) {
        return 'maxDate';
      }
    } else if (value !== undefined) {
      return 'invalidType';
    }
  };
}


module.exports = dateValidator;
