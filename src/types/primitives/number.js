
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
  const {
    required = false,
    nullable = true,
    minNumber = -Infinity,
    maxNumber = Infinity
  } = field;

  return function validator(value, options, context) {
    if ((value === undefined) && required) {
      return 'required';
    } else if ((value === null) && !nullable) {
      return 'isNull';
    } else if ((value !== undefined) && (value !== null)) {
      if ((typeof value !== 'number') || isNaN(value)) {
        return 'invalidType';
      } else if (value < minNumber) {
        return 'minNumber';
      } else if (value > maxNumber) {
        return 'maxNumber';
      }
    }

    return wrappedValidator && wrappedValidator(value, options, context);
  };
}
