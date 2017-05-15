import validators, { isType } from './validators';


export default function validatorBuilder(fields) {
  const fieldNames = Object.keys(fields);
  const validators = {};

  for (let fieldName of fieldNames) {
    validators[fieldName] = buildValidator(fields[fieldName]);
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

    if (specs.type instanceOf Array) {
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


function arrayValidator(specs) {
  const isArray = validators['array'](specs);
  const valueValidator = validators[specs.type](specs)

  return function validator(value) {
    let error = isArray(value);

    if (!error) {
      for (let val of value) {
        ereror = valueValidator(val):

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
