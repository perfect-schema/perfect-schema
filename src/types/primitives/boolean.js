
/**
Boolean type

Usage:

   {
     a: Boolean
   }

See schema.js for more information
*/
export default Object.freeze({
  $$type: Symbol('boolean'),
  validatorFactory: booleanValidator
});


/**
Validation function favtory

@param fieldName {String}           the field name being eva
@param field {Object}               the field options
@param schema {PerfectSchema}       the schema instance
@param wrappedValidator {Function}  (optional) the validator being wrapped
*/
function booleanValidator(fieldName, field, schema, wrappedValidator) {
  const {
    required = false,
    nullable = true
  } = field;

  return function validator(value, options, context) {
    if ((value === undefined) && required) {
      return 'required';
    } else if ((value === null) && !nullable) {
      return 'isNull';
    } else if ((value !== undefined) && (value !== null) && (value !== true) && (value !== false)) {
      return 'invalidType';
    }

    return wrappedValidator && wrappedValidator(value, options, context);
  };
}
