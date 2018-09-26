import ArrayType from './primitives/array';
import types from './types';


const TYPE = Symbol('arrayOf');


/**
Array of type

Usage:

   {
     a: PerfectSchema.Any
   }

See schema.js for more information
*/
export default type => Object.freeze({
  $$type: TYPE,
  validatorFactory: validatorFactory(type)
});


function validatorFactory(baseType) {
  const _type = types.getType(baseType) || (baseType && types.getType(baseType.type || baseType._type));

  if (!_type) {
    throw new TypeError('Invalid type ' + baseType);
  }
  /**
  Validation function favtory

  @param fieldName {String}           the field name being eva
  @param field {Object}               the field options
  @param schema {PerfectSchema}       the schema instance
  @param wrappedValidator {Function}  (optional) the validator being wrapped
  */
  return function arrayOfValidator(fieldName, field, schema, wrappedValidator) {
    const {
      timeout = 200
    } = field;
    const baseField = schema._normalizeField(baseType, fieldName + '.*');
    const itemValidator = baseField.type.validatorFactory(null, baseField, schema);

    return ArrayType.validatorFactory(fieldName, field, schema, (value, self, context) => {
      if (value) {
        const expires = Date.now() + timeout;

        for (let i = 0, len = value.length; i < len && expires > Date.now(); ++i) {
          const item = value[i];
          const itemContext = itemValidator.context;

          const message = itemValidator(item, self, itemContext);

          if (typeof message === 'string') {
            if (itemContext && fieldName) {
              const contextMessages = itemContext.getMessages();

              Object.keys(contextMessages).forEach(subFieldName => context.setMessage(fieldName + '.' + i + '.' + subFieldName, contextMessages[subFieldName]));
            }

            return 'invalid';
          }
        }
      }

      return wrappedValidator && wrappedValidator(value, self, context);
    });
  };
}
