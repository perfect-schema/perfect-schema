
/**
String type

Usage:

   {
     a: String
   }

See schema.js for more information
*/
export default {
  $$type: Symbol('string'),
  validatorFactory: stringValidator
};


/**
Validation function favtory

@param options {Object}          the field options
@param field {String}            the field name being eva
@param schema {PerfectSchema}    the schema instance
@param nextValidator {Function}  the next validator chain
*/
function stringValidator(options, field, schema, nextValidator) {
  return function validator(value) {
    if ((value !== undefined) && (value !== null) && (typeof value !== 'string')) {
      return 'invalidType';
    }

    return nextValidator && nextValidator(value);
  };
}
