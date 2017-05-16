/**
Integer validation

Returns true if value is undefined, or an integer. False otherwise.

@param options {Object}
@return {function}
*/
module.exports = function integerValidator(options) {
  /**
  Validate the given value

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    const intValue = value | 0;

    if (intValue === value) {
      const min = 'min' in options ? options.min : -Infinity;
      const max = 'max' in options ? options.max : Infinity;

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

const IntegerType = Object.create(null, {
  toString: {
    writable: false,
    configurable: false,
    enumerable: false,
    value: function toString() {
      return 'integer';
    }
  }
});

Object.freeze(IntegerType);



module.exports.Type = IntegerType;
