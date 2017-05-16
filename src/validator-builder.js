const validators = require('./validators');


module.export = function validatorBuilder(fields) {
  const fieldNames = Object.keys(fields);
  const validators = {};

  for (let fieldName of fieldNames) {
    let specs = fields[fieldName];
    let validator = buildValidator(specs);

    if (specs.required) {
      validator = requiredValidator(validator);
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
    let isArray = false;

    if (isType(specs)) {
      specs = { type: specs };
    }

    if (specs.type instanceof Array) {
      if (type.length !== 1) {
        throw new TypeError('Invalid array type');
      }

      specs = Object.assign({} , specs, { type: specs.type[0] });
      isArray = true;
    } else if (!isType(specs.type)) {
      throw new TypeError('Unknown or unspecified field type : ' + String(specs.type));
    }

    if (isArray) {
      return arrayValidator(specs);
    } else {
      return validators[specs.type](specs);
    }
  }
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


function arrayValidator(specs) {
  const isArray = validators['array'](specs);
  const valueValidator = validators[specs.type](specs)

  return function validator(value) {
    let error = isArray(value);

    if (!error) {
      for (let val of value) {
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

    for (let specs of anySpecs) {
      validators.push(buildValidator(specs));
    }

    return function validator(value) {
      let error;

      for (let validator of validators) {
        error = validator(value);

        if (error) {
          break;
        }
      }

      return error;
    }
  }
}
