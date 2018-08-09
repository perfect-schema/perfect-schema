
/**
Object type

Usage:

   {
     a: Object
   }

See schema.js for more information
*/
export default {
  $$type: Symbol('object'),
  validatorFactory: objectValidator
};


const proto = Object.prototype;
const gpo = Object.getPrototypeOf;

/**
Validation function favtory

@param field {String}            the field name being eva
@param options {Object}          the field options
@param schema {PerfectSchema}    the schema instance
@param nextValidator {Function}  the next validator chain
*/
function objectValidator(options, field, schema, nextValidator) {
  return function validator(value) {
    if ((value !== undefined) && (value !== null) && ((typeof value !== 'object') || (gpo(value) !== proto))) {
      return 'invalidType';
    }

    return nextValidator && nextValidator(value);
  };
}
