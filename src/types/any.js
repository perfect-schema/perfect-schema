
/**
Any type

Usage:

   {
     a: PerfectSchema.Any
   }

See schema.js for more information
*/
export default Object.freeze({
  $$type: Symbol('any'),
  validatorFactory: anyValidator
});


/**
Validation function favtory

@param fieldName {String}           the field name being eva
@param field {Object}               the field options
@param schema {PerfectSchema}       the schema instance
@param wrappedValidator {Function}  (optional) the validator being wrapped
*/
function anyValidator(fieldName, field, schema, wrappedValidator) {
  const {
    required = false,
    nullable = true
  } = field;

  return function validator(value, options, context) {
    if ((value === undefined) && required) {
      return 'required';
    } else if ((value === null) && !nullable) {
      return 'isNull';
    }

    return wrappedValidator && wrappedValidator(value, options, context);
  };
}
