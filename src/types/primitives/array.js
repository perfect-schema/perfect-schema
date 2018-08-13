
/**
Array type

Usage:

   {
     a: Array
   }

See schema.js for more information
*/
export default Object.freeze({
  $$type: Symbol('array'),
  validatorFactory: arrayValidator
});


/**
Validation function favtory

@param fieldName {String}           the field name being eva
@param field {Object}               the field options
@param schema {PerfectSchema}       the schema instance
@param wrappedValidator {Function}  (optional) the validator being wrapped
*/
function arrayValidator(fieldName, field, schema, wrappedValidator) {
  return function validator(value, options, context) {
    if ((value !== undefined) && (value !== null) && !Array.isArray(value)) {
      return 'invalidType';
    }

    return wrappedValidator && wrappedValidator(value, options, context);
  };
}
