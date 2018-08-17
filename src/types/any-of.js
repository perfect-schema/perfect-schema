import types from './types';


/**
Array of type

Usage:

   {
     a: PerfectSchema.Any
   }

See schema.js for more information
*/
export default (...allowedTypes) => Object.freeze({
  $$type: Symbol('anyOf'),
  validatorFactory: validatorFactory(...allowedTypes)
});


function validatorFactory(...allowedTypes) {
  if (!allowedTypes.length) {
    throw new TypeError('Missing types');
  }

  const _allowedTypes =  allowedTypes.map(type => {
    const _type = types.getType(type) || (type && types.getType(type._type));

    if (!_type) {
      throw new TypeError('Invalid type ' + type);
    }

    return _type;
  });

  /**
  Validation function favtory

  @param fieldName {String}           the field name being eva
  @param field {Object}               the field options
  @param schema {PerfectSchema}       the schema instance
  @param wrappedValidator {Function}  (optional) the validator being wrapped
  */
  return function anyOfValidator(fieldName, field, schema, wrappedValidator) {
    const itemValidators = _allowedTypes.map(_type => _type.validatorFactory(fieldName, field, schema));

    return function validator(value, options, context) {
      if ((value !== undefined) && (value !== null)) {
        let message;
        let validFound = false;

        for (const itemValidator of itemValidators) {
          const _message = itemValidator(value);

          if (!_message) {
            validFound = true;
          } else if (!message) {
            message = _message;
          }
        }

        if (!validFound && (typeof message === 'string')) {
          return message;
        }
      }

      return wrappedValidator && wrappedValidator(value, options, context);
    };
  };
}
