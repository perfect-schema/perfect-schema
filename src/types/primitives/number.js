
/**
Number type

Usage:

   {
     a: Number
   }

See schema.js for more information
*/
export default Object.freeze({
  $$type: Symbol('number'),
  validatorFactory: numberValidator
});


/**
Validation function favtory

@param fieldName {String}           the field name being eva
@param field {Object}               the field options
@param schema {PerfectSchema}       the schema instance
@param wrappedValidator {Function}  (optional) the validator being wrapped
*/
function numberValidator(fieldName, field, schema, wrappedValidator) {
  return function validator(value, options, context) {
    if ((value !== undefined) && (value !== null) && ((typeof value !== 'number') || isNaN(value))) {
      return 'invalidType';
    }

    return wrappedValidator && wrappedValidator(value, options, context);
  };
}
