import NumberType from './primitives/number';

/**
Integer type

Usage:

   {
     a: PerfectSchema.Integer
   }

See schema.js for more information
*/
export default Object.freeze({
  $$type: Symbol('integer'),
  validatorFactory: integerValidator
});


/**
Validation function favtory

@param fieldName {String}           the field name being eva
@param field {Object}               the field options
@param schema {PerfectSchema}       the schema instance
@param wrappedValidator {Function}  (optional) the validator being wrapped
*/
function integerValidator(fieldName, field, schema, wrappedValidator) {
  return NumberType.validatorFactory(fieldName, field, schema, (value, self, context) => {
    if (value) {
      if (((value | 0) !== value) || (value === -Infinity) || (value === Infinity)) {
        return 'invalidType';
      }
    }

    return wrappedValidator && wrappedValidator(value, self, context);
  });
}
