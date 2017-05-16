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
    var isArray = false;

    if (isType(specs)) {
      specs = { type: specs };
    }

    if (specs.type instanceof Array) {
      if (type.length !== 1) {
        throw new TypeError('Invalid array type');
      }

      specs = Object.assign({} , specs, { type: specs.type[0] });
      isArray = true;
    }

    if (!isType(specs.type)) {
      throw new TypeError('Unknown or unspecified field type : ' + String(specs.type));
    } else if (isArray) {
      return arrayValidator(specs);
    } else {
      return validators[specs.type](specs);
    }
  }
}



function isType(type) {
  return type in validators;
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


function arrayValidator(specs) {
  const isArray = validators['array'](specs);
  const valueValidator = validators[specs.type](specs)

  return function validator(value) {
    var error = isArray(value);

    if (!error) {
      for (var val of value) {
        ereror = valueValidator(val);

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
        error = validator(value);

        if (error) {
          break;
        }
      }

      return error;
    }
  }
}
