
/**
Boolean type

Usage:

   {
     a: Boolean
   }

See schema.js for more information
*/
export default {
  $$type: Symbol('boolean'),
  validatorFactory: booleanValidator
};


/**
Validation function favtory

@param field {String}            the field name being eva
@param options {Object}          the field options
@param schema {PerfectSchema}    the schema instance
@param nextValidator {Function}  the next validator chain
*/
function booleanValidator(options, field, schema, nextValidator) {
  return function validator(value) {
    if ((value !== undefined) && (value !== null) && (value !== true) && (value !== false)) {
      return 'invalidType';
    }

    return nextValidator && nextValidator(value);
  };
}
