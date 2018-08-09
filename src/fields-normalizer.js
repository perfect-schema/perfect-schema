import varValidator from 'var-validator';
//import isPlainObject from 'is-plain-object';
import primitiveTypes from './types/primitives';

//
varValidator.enableScope = false;
varValidator.enableBrackets = false;


/**
Sanitize all fields from the given object, make sure that each
key is a valid name, and that each type if a recognized validator

@param schema {PerfectSchema}
*/
export function normalizeFields(fields, schema) {
  const fieldNames = Object.keys(fields);

  for (const fieldName of fieldNames) {
    let field = fields[fieldName];

    if (!varValidator.isValid(fieldName)) {
      throw new Error('Invalid field name : ' + fieldName);
    } else if (!field) {
      throw new TypeError('Invalid field specification for ' + fieldName + ' : ' + field);
    }

    if (!field.type) {
      fields[fieldName] = field = { type: field };
    }

    if (field.type in primitiveTypes) {
      field.type = primitiveTypes[field.type];
    }

    if (!(field.type.$$type && typeof field.type.validatorFactory === 'function')) {
      throw new TypeError('Invalid field type for ' + fieldName);
    } else {
      field.validator = field.type.validatorFactory(fieldName, field.options, schema);
    }
  }

  return fields;
}
