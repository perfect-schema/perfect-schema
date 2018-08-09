
/**
Number type

Usage:

   {
     a: Number
   }

See schema.js for more information
*/
export default {
  $$type: Symbol('number'),
  validatorFactory: numberValidator
};


/**
Validation function favtory

@param field {String}            the field name being eva
@param options {Object}          the field options
@param schema {PerfectSchema}    the schema instance
@param nextValidator {Function}  the next validator chain
*/
function numberValidator(options, field, schema, nextValidator) {
  return function validator(value) {
    if ((value !== undefined) && (value !== null) && (typeof value !== 'number')) {
      return 'invalidType';
    }

    return nextValidator && nextValidator(value);
  };
}
