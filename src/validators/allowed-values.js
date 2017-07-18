/**
Allowed value validation : make sure the field only provides one of the specified values

@param field {string}         the field name
@param specs {object}         the field specs
@param validator {funciton}   the current validator (if any)
@return {function}
*/
function allowedValuesValidator(field, specs, validator) {
  const allowedValues = specs && specs.allowedValues;

	if (allowedValues) {
    if (!Array.isArray(allowedValues)) {
      throw new TypeError('Allowed values must be an array');
    } else if (!allowedValues.length) {
      throw new TypeError('Empty allowed values');
    }

    const len = allowedValues.length;

		/**
    Ensure that the value is any of the following values.

    @param value {any}
    @param ctx {ValidationContext}
    @return {string|undefined}
    */
		return function allowedValues(value, ctx) {
      var found = false;

      for (var i = 0; i < len; ++i) {
        if (value === allowedValues[i]) {
          found = true;
        }
      }

      return found ? validator(value, ctx) : 'notAllowed';
		}
	} else {
		return validator
	}
}


module.exports = allowedValuesValidator
