
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
  const {
    required = false,
    nullable = true,
    minDate = -Infinity,
    maxDate = Infinity
  } = field;

  return function validator(value, self, context) {
    if ((value === undefined) && required) {
      return 'required';
    } else if ((value === null) && !nullable) {
      return 'isNull';
    } else if ((value !== undefined) && (value !== null)) {
      if (!(value instanceof Date)) {
        return 'invalidType';
      } else if (isNaN(value.getTime())) {
        return 'invalidDate';
      } else if (value < minDate) {
        return 'minDate';
      } else if (value > maxDate) {
        return 'maxDate';
      }
    }

    return wrappedValidator && wrappedValidator(value, self, context);
  };
}
