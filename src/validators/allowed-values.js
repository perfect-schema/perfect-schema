/**
Allowed value validation : make sure the field only provides one of the specified values

@param field {string}         the field name
@param specs {object}         the field specs
@param validator {funciton}   the current validator (if any)
@return {function}
*/
function allowedValuesValidator(field, specs, validator) {
  const allowed = specs && specs.allowedValues;

	if (allowed !== undefined) {
    if (!Array.isArray(allowed)) {
      throw new TypeError('Allowed values must be an array');
    } else if (!allowed.length) {
      throw new TypeError('Empty allowed values');
    }

    const len = allowed.length;

		/**
    Ensure that the value is any of the following values.

    @param value {any}
    @param ctx {ValidationContext}
    @return {string|undefined}
    */
		return function allowedValues(value, ctx) {
      for (var i = 0; i < len; ++i) {
        if (value === allowed[i]) {
          return validator(value, ctx);
        }
      }

      return 'notAllowed';
		}
	} else {
		return validator
	}
}


module.exports = allowedValuesValidator
