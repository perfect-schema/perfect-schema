const validators = require('./validators');


function normalizeFields(fields) {
  const fieldNames = Object.keys(fields || {});
  var specs;

  for (var fieldName of fieldNames) {
    specs = fields[fieldName];

    if (Array.isArray(specs) || isType(specs)) {
      fields[fieldName] = { type: specs };
    }
  }

  return fields;
};


function isType(type) {
  return type && (type in validators);
}


function isSchema(type) {
  return type && type.__proto__ && type.__proto__.constructor && (type.__proto__.constructor.name === 'PerfectSchema');
}


normalizeFields.normalizeFields = normalizeFields;
normalizeFields.isType = isType;
normalizeFields.isSchema = isSchema;

module.exports = normalizeFields;
