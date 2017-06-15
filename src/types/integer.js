/**
Integer validation

Return a validator that will check if the value is an integer.

Options:
 - min {Numeric}       min value (inclusive)
 - max {Numeric}       max value (exclusive)

@oaram field {string}
@param specs {Object}
@return {function}
*/
function integerValidator(field, specs) {
  const min = 'min' in specs ? specs.min : -Infinity;
  const max = 'max' in specs ? specs.max : Infinity;

  /**
  Validate the given value if it is an integer or undefined, and return the error message
  or undefined if validated.

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    const intValue = value | 0;

    if (intValue === value) {
      if (intValue < min) {
        return 'minInteger';
      } else if (intValue > max) {
        return 'maxInteger';
      }
    } else if (value !== undefined) {
      return 'invalidType';
    }
  };
};

const IntegerType = Object.freeze(Object.create(null, {
  toString: {
    writable: false,
    configurable: false,
    enumerable: false,
    value: function toString() {
      return 'integer';
    }
  }
}));


integerValidator.Type = IntegerType;

module.exports = integerValidator;
