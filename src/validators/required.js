/**
Required validation : make sure the field is not undefined

@param field {string}         the field name
@param specs {object}         the field specs
@param validator {funciton}   the current validator (if any)
@return {function}
*/
function requiredValidator(field, specs, validator) {
	if (specs && specs.required) {
		/**
    Ensure that the value is set. If the value is undefined, the error "required"
    is returned. Otherwise, the validation is forwared to the validator function,
    and whatever value is returned.

    @param value {any}
    @param ctx {ValidationContext}
    @return {string|undefined}
    */
		return function required(value, ctx) {
			return value === undefined ? 'required' : validator(value, ctx)
		}
	} else {
		return validator
	}
}


module.exports = requiredValidator
