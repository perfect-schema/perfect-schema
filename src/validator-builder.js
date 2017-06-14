'use strict';

function validatorBuilder(fields) {
  const fieldNames = Object.keys(fields || {});
  const validators = {};
  var specs;
  var validator;

  for (var fieldName of fieldNames) {
    specs = fields[fieldName];
    validator = plugins.applyPlugins(specs, buildValidator(specs));

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
    var isWildcard = false;

    if (isAny(specs) || isType(specs) || isSchema(specs) || (specs instanceof Array)) {
      type = specs;
      specs = { type: type };
    } else {
      type = specs.type;
    }

    if (!isAny(type) && (type instanceof Array)) {
      if (!type.length) {
        specs.type = type = Array;
      } else if (type.length === 1) {
        type = type[0];
        isArray = true;
      } else {
        specs.type = type = any.apply(any, type);
        isWildcard = true;
      }
    }

    isWildcard = isWildcard || isAny(type);

    if (!isWildcard && !isType(type) && !isSchema(type)) {
      throw new TypeError('Unknown or unspecified field type : ' + JSON.stringify(type));
    }

    if (isArray) {
      return arrayValidator(type, specs);
    } else if (isWildcard) {
      return anyValidator(specs);
    } else if (isSchema(type)) {
      return schemaValidator(type);
    } else {
      return validators[specs.type](specs);
    }
  }
}



function noop() {}


function arrayValidator(type, specs) {
  const isArray = validators[Array](specs.arrayOptions || {});
  const elementSpecs = Object.assign({}, specs, { type: type });
  const valueValidator = buildValidator(elementSpecs);

  elementSpecs.arrayOptions = undefined;

  return function arrayValidator(value) {
    var result = isArray(value);

    if (typeof result === 'string') {
      return result;
    } else {
      var hasError = false;
      var asyncValidation = [];

      for (var val of value) {
        result = valueValidator(val);

        if (result instanceof Promise) {
          asyncValidation.push(result);
        } else if (typeof result === 'string') {
          hasError = true;
          break;
        }
      }

      if (hasError) {
        return result;
      } else if (asyncValidation.length) {
        return Promise.all(asyncValidation).then(results => {
          for (var index = 0, len = results.length; index < len; ++index) {
            result = results[index];

            if (result && (typeof result === 'string')) {
              return result + '@' + index;
            }
          }
        });
      }
    }
  };
}


function anyValidator(anySpecs) {
  const types = anySpecs.type;

  if (!types.length) {
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
const plugins = require('./validation-plugins');
const any = require('./any');
const validationContext = require('./validation-context');
const normalizeFields = require('./normalize-fields');
const PerfectSchema = require('./schema');

const isType = validators.isType;
const isSchema = PerfectSchema.isSchema;
const isAny = any.isAny;
