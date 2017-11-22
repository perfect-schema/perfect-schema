import varValidator from 'var-validator';

//
varValidator.enableScope = false;
varValidator.enableBrackets = false;


/**
Sanitize all fields from the given object, make sure that each
key is a valid name, and that each type if a recognized validator

@param fields {Object}
*/
export function sanitizeFields(fields) {
  for (let fieldName in fields) {
    if (!varValidator.isValid(fieldName)) {
      throw new Error('Invalid field name : ' + fieldName);
    }

    /* TODO : check field type */

  }

  return fields;
}
