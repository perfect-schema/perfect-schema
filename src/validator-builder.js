const validators = require('./validators');


module.exports = function validatorBuilder(fields) {
  const fieldNames = Object.keys(fields || {});
  const validators = {};
  var specs;
  var validator;

  for (var fieldName of fieldNames) {
    specs = fields[fieldName];
    validator = buildValidator(specs);

    if (specs.required) {
      validator = requiredValidator(validator);
    }
    if (specs.nullable) {
      validator = nullableValidator(validator);
    }
    if (typeof specs.custom === 'function') {
      validator = customValidator(validator, specs);
    }

    validators[fieldName] = validator;
  }

  return validators;
}

function buildValidator(specs) {
  if (!specs) {
    throw new TypeError('Invalid field type : ' + String(specs));
  } else if (specs.$any) {
    return anyValidator(specs);
  } else {
    var type;
    var isArray = false;

    if (isType(specs)) {
      type = specs;
      specs = { type: type };
    } else {
      type = specs.type;
    }

    if (type instanceof Array) {
      if (type.length !== 1) {
        throw new TypeError('Invalid array type');
      }

      type = type[0];
      isArray = true;
    }

    if (!isType(type)) {
      throw new TypeError('Unknown or unspecified field type : ' + JSON.stringify(type));
    }

    if (isArray) {
      return arrayValidator(type, specs);
    } else if (typeof type.validate === 'function') {
      return schemaValidator(type);
    } else {
      return validators[specs.type](specs);
    }
  }
}



function isType(type) {
  return type && ((type in validators) || (typeof type.validate === 'function'));
}

function noop() {}


function requiredValidator(validator) {
  return function required(value) {
    if (value === undefined) {
      return 'required';
    } else {
      return validator(value);
    }
  };
}

function nullableValidator(validator) {
  return function nullable(value) {
    if (value !== null) {
      return validator(value);
    }
  };
}

function customValidator(validator, specs) {
  const custom = specs.custom.bind(specs);

  return function validator(value) {
    return custom(value) || validator(value);
  };
}


function arrayValidator(type, specs) {
  const isArray = validators['array'](specs.arrayOptions || {});
  const valueValidator = validators[type](specs)

  return function validator(value) {
    var error = isArray(value);

    if (!error) {
      for (var val of value) {
        error = valueValidator(val);

        if (error) {
          break;
        }
      }
    }

    return error;
  };
}


function anyValidator(anySpecs) {
  if (!anySpecs.length) {
    return noop;
  } else {
    const validators = [];

    for (var specs of anySpecs) {
      validators.push(buildValidator(specs));
    }

    return function validator(value) {
      var error;

      for (var validator of validators) {
        var err = validator(value);

        if (!err) {
          error = undefined;
          break;
        } else {
          error = err;
        }
      }

      return error;
    };
  }
}


function schemaValidator(schema) {
  return function validator(value) {
    return schema.validate(value);
  };
}
