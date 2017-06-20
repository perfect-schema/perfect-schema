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
  const elementValidator = 'elementType' in specs ? buildValidator(field, specs.elementType) : undefined;

  /**
  Validate the given value if it is an array or undefined, and return the error message
  or undefined if validated.

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value, ctx) {
    if (Array.isArray(value)) {
      const len = value.length;

      if (len < min) {
        return 'minArray';
      } else if (len > max) {
        return 'maxArray';
      }

      if (elementValidator) {
        const asyncResults = [];
        var element, result;

        for (element of value) {
          result = elementValidator(element, ctx);

          if (typeof result === 'string') {
            return result;
          } else if (result instanceof Promise) {
            asyncResults.push(result);
          }
        }

        if (asyncResults.length) {
          return Promise.all(asyncResults).then(messages => {
            for (var message of messages) {
              if (typeof message === 'string') {
                return message;
              }
            }
          });
        }
      }
    } else if (value !== undefined) {
      return 'invalidType';
    }
  };
}


module.exports = arrayValidator;


const validators = require('../validators');
const buildValidator = validators.build;
