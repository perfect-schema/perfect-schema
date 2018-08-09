

/**
Create a new model given the specified fields

@param schema {PerfectSchema}
@return {Object}
*/
export function createModel(schema) {
  const { fields, fieldNames } = schema;
  const model = {};

  for (const fieldName of fieldNames) {
    const field = fields[fieldName];

    if (field.defaultValue) {
      model[fieldName] = (typeof field.defaultValue === 'function') ? field.defaultValue() : field.defaultValue
    }
  }

  return model;
}
