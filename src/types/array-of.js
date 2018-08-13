import ArrayType from './primitives/array';
import types from './types';


/**
Array of type

Usage:

   {
     a: PerfectSchema.Any
   }

See schema.js for more information
*/
export default type => Object.freeze({
  $$type: Symbol('arrayOf'),
  validatorFactory: validatorFactory(type)
});


function validatorFactory(type) {
  const _type = types.getType(type) || (type && types.getType(type._type));

  if (!_type) {
    throw new TypeError('Invalid type ' + type);
  }

  /**
  Validation function favtory

  @param fieldName {String}           the field name being eva
  @param field {Object}               the field options
  @param schema {PerfectSchema}       the schema instance
  @param wrappedValidator {Function}  (optional) the validator being wrapped
  */
  return function arrayOfValidator(fieldName, field, schema, wrappedValidator) {
    const itemValidator = _type.validatorFactory(fieldName, field, schema);

    return ArrayType.validatorFactory(fieldName, field, schema, (value, options, context) => {
      if (value) {
        for (let i = 0, len = value.length; i < len; ++i) {
          const item = value[i];
          const message = itemValidator(item);

          if (typeof message === 'string') {
            if (itemValidator.context) {
              const itemContext = itemValidator.context;
              const contextMessages = itemContext.getMessages();

              Object.keys(contextMessages).forEach(subFieldName => context.setMessage(fieldName + '.' + i + '.' + subFieldName, contextMessages[subFieldName]));
            }

            //if (context) {
            //  context.setMessage(fieldName + '.' + i, message);
            //}

            return 'invalid';
          }
        }
      }

      return wrappedValidator && wrappedValidator(value, options, context);
    });
  };
}
