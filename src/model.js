

/**
Create a new model given the specified fields

@param schema {PerfectSchema}
@return {Object}
*/
export function createModel(schema, data) {
  const { fields, fieldNames } = schema;
  const model = Object.assign({}, data || {});

  for (const fieldName of fieldNames) {
    const field = fields[fieldName];

    if (!(fieldName in model) && ('defaultValue' in field)) {
      model[fieldName] = (typeof field.defaultValue === 'function') ? field.defaultValue() : field.defaultValue
    }
  }

  return model;
}
