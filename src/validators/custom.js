/**
Custom validation : allow user specified custom validation

@param field {string}         the field name
@param specs {object}         the field specs
@param validator {funciton}   the current validator (if any)
@return {function}
*/
function customValidator(field, specs, validator) {
  if ('custom' in specs) {
    if (typeof specs.custom !== 'function') {
      throw new TypeError('Custom validator should be a function for ' + field);
    }

    const userCustom = specs.custom.bind(specs);

    /**
    Invoke the custom validator function if all current validation passes

    @param value {any}
    @param ctx {ValidationContext}
    @return {string|Promise|undefined}
    */
    return function custom(value, ctx) {
      const result = userCustom(value, ctx);

      if (typeof result === 'string') {
        return result;
      } else if (result instanceof Promise) {
        return result.then(message => {
          if (typeof message === 'string') {
            return message;
          } else {
            return validator(value, ctx)
          }
        });
      } else {
         return validator(value, ctx);
      }
    };
  } else {
    return validator;
  }
}

module.exports = customValidator;
