import varValidator from 'var-validator';
//import isPlainObject from 'is-plain-object';
import types from './types/types';

//
varValidator.enableScope = false;
varValidator.enableBrackets = false;


/**
Sanitize all fields from the given object, make sure that each
key is a valid name, and that each type if a recognized validator

@param schema {PerfectSchema}
*/
export function normalizeFields(fields, schema, PerfectSchema) {
  const fieldNames = Object.keys(fields);

  for (const fieldName of fieldNames) {
    let field = fields[fieldName];

    if (!varValidator.isValid(fieldName)) {
      throw new Error('Invalid field name : ' + fieldName);
    } else if (!field) {
      throw new TypeError('Empty field specification for ' + fieldName);
    } else if (!field.type) {
      fields[fieldName] = field = { type: field };
    }

    if (field.type instanceof PerfectSchema) {
      field.type = field.type._type;
    } else {
      field.type = types.getType(field.type);

      if (!field.type) {
        throw new TypeError('Invalid field specification for ' + fieldName);
      }
    }

    field.validator = field.type.validatorFactory(fieldName, field, schema, field.validator);
  }

  return fields;
}
