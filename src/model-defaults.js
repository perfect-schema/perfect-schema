

/**
Create a new model given the specified fields

@param schema {PerfectSchema}
@return {Object}
*/
export function createModel(schema) {
  const { fields } = schema;
  const model = {};

  for (let fieldName in fields) {
    let field = fields[fieldName];

    if (field.defaultValue) {
      model[fieldName] = (typeof field.defaultValue === 'function') ? field.defaultValue() : field.defaultValue
    }
  }

  return model;
};
