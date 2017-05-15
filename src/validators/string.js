/**
String validation

Returns true if value is undefined, or a string. False otherwise.

@param value {mixed}
@param options {Object}
@return {boolean}
*/
export default function stringValidator(options) {
  return validate(value) {
    if (typeof value === 'string') {
      const { min = 0, max = Infinity } = options;

      if (value.length < min) {
        return 'minString';
      } else if (value.length > max) {
        return 'maxString';
      }
    } else {
      return 'invalidType';
    }
  };
}
