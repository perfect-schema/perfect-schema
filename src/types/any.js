
/**
Any type

Usage:

   {
     a: PerfectSchema.Any
   }

See schema.js for more information
*/
export default {
  $$type: Symbol('any'),
  validatorFactory: anyValidator
};


/**
Validation function favtory

@param field {String}            the field name being eva
@param options {Object}          the field options
@param schema {PerfectSchema}    the schema instance
@param nextValidator {Function}  the next validator chain
*/
function anyValidator(field, options, schema, nextValidator) {
  return function validator(value) {
    return nextValidator && nextValidator(value);
  };
}
