
/**
Array type

Usage:

   {
     a: Array
   }

See schema.js for more information
*/
export default {
  $$type: Symbol('array'),
  validatorFactory: arrayValidator
};


/**
Validation function favtory

@param field {String}            the field name being eva
@param options {Object}          the field options
@param schema {PerfectSchema}    the schema instance
@param nextValidator {Function}  the next validator chain
*/
function arrayValidator(options, field, schema, nextValidator) {
  return function validator(value) {
    if ((value !== undefined) && (value !== null) && !Array.isArray(value)) {
      return 'invalidType';
    }

    return nextValidator && nextValidator(value);
  };
}
