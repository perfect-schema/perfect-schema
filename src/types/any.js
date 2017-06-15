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

  if (specs.allowedTypes instanceof Array) {
    for (var type of specs.allowedTypes) {
      typeValidators.push(buildValidator(field, specs));
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
      return Promise.all(typeValidators.map(validator => validator(value, ctx))).then(messages => {
        var error = undefined;
        var valid = false;

        for (var message in messages) {
          if ((typeof message === 'string') && (!error || (error === 'invalidType'))) {
            error = message;
          } else if (!message) {
            valid = true;
          }
        }

        return !valid ? error : undefined;
      });
    };
  } else {
    return function validate() {};
  }
};

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
