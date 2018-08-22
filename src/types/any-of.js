import types from './types';


const TYPE = Symbol('anyOf');

/**
Array of type

Usage:

   {
     a: PerfectSchema.Any
   }

See schema.js for more information
*/
export default (...allowedTypes) => Object.freeze({
  $$type: TYPE,
  validatorFactory: validatorFactory(...allowedTypes)
});


function validatorFactory(...allowedTypes) {
  if (!allowedTypes.length) {
    throw new TypeError('Missing types');
  }

  const _allowedTypes = allowedTypes.map(type => {
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
    const {
      required = false,
      nullable = true,
    } = field;
    const itemValidators = _allowedTypes.map(_type => _type.validatorFactory(fieldName, field, schema));

    return function validator(value, options, context) {
      if ((value === undefined) && required) {
        return 'required';
      } else if ((value === null) && !nullable) {
        return 'isNull';
      } else if ((value !== undefined) && (value !== null)) {
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
