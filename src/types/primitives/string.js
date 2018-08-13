
/**
String type

Usage:

   {
     a: String
   }

See schema.js for more information
*/
export default Object.freeze({
  $$type: Symbol('string'),
  validatorFactory: stringValidator
});


/**
Validation function favtory

@param fieldName {String}           the field name being eva
@param field {Object}               the field options
@param schema {PerfectSchema}       the schema instance
@param wrappedValidator {Function}  (optional) the validator being wrapped
*/
function stringValidator(fieldName, field, schema, wrappedValidator) {
  return function validator(value, options, context) {
    if ((value !== undefined) && (value !== null) && (typeof value !== 'string')) {
      return 'invalidType';
    }

    return wrappedValidator && wrappedValidator(value, options, context);
  };
}
