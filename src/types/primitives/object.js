
/**
Object type

Usage:

   {
     a: Object
   }

See schema.js for more information
*/
export default Object.freeze({
  $$type: Symbol('object'),
  validatorFactory: objectValidator
});


const proto = Object.prototype;
const gpo = Object.getPrototypeOf;

/**
Validation function favtory

@param fieldName {String}           the field name being eva
@param field {Object}               the field options
@param schema {PerfectSchema}       the schema instance
@param wrappedValidator {Function}  (optional) the validator being wrapped
*/
function objectValidator(fieldName, field, schema, wrappedValidator) {
  return function validator(value, options, context) {
    if ((value !== undefined) && (value !== null) && ((typeof value !== 'object') || (gpo(value) !== proto))) {
      return 'invalidType';
    }

    return wrappedValidator && wrappedValidator(value, options, context);
  };
}
