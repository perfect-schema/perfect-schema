'use strict';

function validatorBuilder(fields) {
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
  } else {
    var type;
    var isArray = false;

    if (isAny(specs) || isType(specs) || isSchema(specs) || (specs instanceof Array)) {
      type = specs;
      specs = { type: type };
    } else {
      type = specs.type;
    }

    var isWildcard = isAny(type);

    if (!isWildcard && (type instanceof Array)) {
      if (type.length) {
        if (type.length !== 1) {
          throw new TypeError('Invalid array type');
        }

        type = type[0];
        isArray = true;
      } else {
        specs = { type: type = Array };
      }
    }

    if (!isWildcard && !isType(type) && !isSchema(type)) {
      throw new TypeError('Unknown or unspecified field type : ' + JSON.stringify(type));
    }

    if (isWildcard) {
      return anyValidator(specs);
    } else if (isArray) {
      return arrayValidator(type, specs);
    } else if (isSchema(type)) {
      return schemaValidator(type);
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

function nullableValidator(validator) {
  return function nullable(value) {
    if (value !== null) {
      return validator(value);
    }
  };
}

function customValidator(validator, specs) {
  const custom = specs.custom.bind(specs);

  return function customValidator(value, ctx) {
    const customResult = custom(value, ctx);

    if (typeof customResult === 'string') {
      return customResult;
    } else if (customResult instanceof Promise) {
      return customResult.then(error => typeof error === 'string' ? error : validator(value, ctx));
    } else {
      return validator(value, ctx);
    }
  };
}


function arrayValidator(type, specs) {
  const isArray = validators[Array](specs.arrayOptions || {});
  const elementSpecs = Object.assign({}, specs, { type: type });
  const valueValidator = buildValidator(elementSpecs);

  return function validator(value) {
    var error = isArray(value);

    if (typeof error !== 'string') {
      var hasError = false;
      var asyncValidation = [];

      for (var val of value) {
        error = valueValidator(val);

        if (error instanceof Promise) {
          asyncValidation.push(error);
        } else if (typeof error === 'string') {
          hasError = true;
          break;
        }
      }

      if (hasError) {
        return error;
      } else if (asyncValidation.length) {
        return Promise.all(asyncValidation).then(results => {
          for (var err of results) {
            if (err && (typeof err === 'string')) {
              return err;
            }
          }
        });
      }
    } else {
      return error;
    }
  };
}


function anyValidator(anySpecs) {
  const baseSpecs = anySpecs;
  const types = anySpecs.type;

  baseSpecs.type = undefined;

  if (!types.length) {
    // TODO : custom()
    return noop;
  } else {
    const validators = [];

    for (var specs of types) {
      validators.push(buildValidator(specs));
    }

    return function validator(value) {
      var error;

      for (var validator of validators) {
        var err = validator(value);

        if (typeof err === 'string') {
          error = err;
        } else {
          error = undefined;
          break;
        }
      }

      return error;
    };
  }
}


function schemaValidator(schema) {
  return function validator(value, ctx) {
    if (value && (value._schema === schema)) {
      return schema.validate(value._data, ctx).then(messages => {
        if (messages.length) {
          return 'invalid';
        }
      });
    } else if (value !== undefined) {
      return 'invalidType';
    }
  };
}


module.exports = validatorBuilder;


const validators = require('./validators');
const any = require('./any');
const validationContext = require('./validation-context');
const normalizeFields = require('./normalize-fields');
const PerfectSchema = require('./schema');

const isType = validators.isType;
const isSchema = PerfectSchema.isSchema;
const isAny = any.isAny;
