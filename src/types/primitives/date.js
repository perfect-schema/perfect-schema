
/**
Date type

Usage:

   {
     a: Date
   }

See schema.js for more information
*/
export default Object.freeze({
  $$type: Symbol('date'),
  validatorFactory: dateValidator
});


/**
Validation function favtory

@param fieldName {String}           the field name being eva
@param field {Object}               the field options
@param schema {PerfectSchema}       the schema instance
@param wrappedValidator {Function}  (optional) the validator being wrapped
*/
function dateValidator(fieldName, field, schema, wrappedValidator) {
  return function validator(value, options, context) {
    if ((value !== undefined) && (value !== null) && !(value instanceof Date)) {
      return 'invalidType';
    } else if (value && isNaN(value.getTime())) {
      return 'invalidDate';
    }

    return wrappedValidator && wrappedValidator(value, options, context);
  };
}
