/**
Any validation

Return a validator that will check if the value matches any of the
specified types

Options:
 - allowedTypes {Array}       an array of allowed types

@oaram field {string}
@param specs {Object}
@return {function}
*/
function anyValidator(field, specs) {
  const typeValidators = [];

  if ('allowedTypes' in specs) {
    if (specs.allowedTypes instanceof Array) {
      for (var type of specs.allowedTypes) {
        typeValidators.push(buildValidator(field, type));
      }
    } else {
      throw new TypeError('Allowed types must be an array')
    }
  }

  if (typeValidators.length) {
    /**
    Validate the given value if it matches any of the types or undefined, and return the error message
    or undefined if validated.

    @param value {mixed}
    @return {undefined|string}
    */
    return function validate(value, ctx) {
      const asyncResults = [];
      var typeValidator, result;
      var error = undefined;
      var valid = false;

      for (typeValidator of typeValidators) {
        result = typeValidator(value, ctx);

        if (!result) {
          valid = true;
        } else if ((typeof result === 'string') && (!error || (error === 'invalidType'))) {
          error = result;
        } else if (result instanceof Promise) {
          asyncResults.push(result);
        }
      }

      if (!valid && asyncResults.length) {
        return Promise.all(asyncResults).then(messages => {
          for (var message of messages) {
            if ((typeof message === 'string') && (!error || (error === 'invalidType'))) {
              error = message;
            } else if (!message) {
              valid = true;
            }
          }

          return !valid ? error : undefined;
        });
      } else {
        return !valid ? error : undefined;
      }
    };
  } else {
    return function validate() {};
  }
}

const AnyType = Object.freeze(Object.create(null, {
  toString: {
    writable: false,
    configurable: false,
    enumerable: false,
    value: function toString() {
      return 'any';
    }
  }
}));


anyValidator.Type = AnyType;

module.exports = anyValidator;


const validators = require('../validators');

const buildValidator = validators.build;
