
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
  const {
    required = false,
    nullable = true,
    minCount = 0,
    maxCount = Infinity,
  } = field;

  return function validator(value, options, context) {
    if ((value === undefined) && required) {
      return 'required';
    } else if ((value === null) && !nullable) {
      return 'isNull';
    } else if ((value !== undefined) && (value !== null)) {
      if (!Array.isArray(value)) {
        return 'invalidType';
      } else if (value.length < minCount) {
        return 'minCount';
      } else if (value.length > maxCount) {
        return 'maxCount';
      }
    }

    return wrappedValidator && wrappedValidator(value, options, context);
  };
}
