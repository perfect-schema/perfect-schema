/**
Required validation : allow the field to be null or not

@param field {string}         the field name
@param specs {object}         the field specs
@param validator {funciton}   the current validator (if any)
@return {function}
*/
function nullableValidator(field, specs, validator) {
	if (specs && specs.nullable) {
		/**
    Allow null values.

    @param value {any}
    @param ctx {ValidationContext}
    @return {string|undefined}
    */
		return function nullable(value, ctx) {
			return value !== null ? validator(value, ctx) : undefined
		}
	} else {
		return function notNullable(value, ctx) {
			return value === null ? 'noValue' : validator(value, ctx)
		}
	}
}

module.exports = nullableValidator
