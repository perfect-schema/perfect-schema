
/**
Date type

Usage:

   {
     a: Date
   }

See schema.js for more information
*/
export default {
  $$type: Symbol('date'),
  validatorFactory: dateValidator
};


/**
Validation function favtory

@param field {String}            the field name being eva
@param options {Object}          the field options
@param schema {PerfectSchema}    the schema instance
@param nextValidator {Function}  the next validator chain
*/
function dateValidator(options, field, schema, nextValidator) {
  return function validator(value) {
    if ((value !== undefined) && (value !== null) && !(value instanceof Date)) {
      return 'invalidType';
    } else if (value && isNaN(value.getTime())) {
      return 'invalidDate';
    }

    return nextValidator && nextValidator(value);
  };
}
