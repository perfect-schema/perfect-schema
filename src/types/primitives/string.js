
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
  const {
    required = false,
    nullable = true,
    minLength = 0,
    maxLength = Infinity
  } = field;

  return function validator(value, options, context) {
    if ((value === undefined) && required) {
      return 'required';
    } else if ((value === null) && !nullable) {
      return 'isNull';
    } else if ((value !== undefined) && (value !== null)) {
      if (typeof value !== 'string') {
        return 'invalidType';
      } else if (value.length < minLength) {
        return 'minLength';
      } else if (value.length > maxLength) {
        return 'maxLength';
      }
    }

    return wrappedValidator && wrappedValidator(value, options, context);
  };
}
