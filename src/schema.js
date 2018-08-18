import varValidator from 'var-validator';

import ValidationContext from './context';
import { createModel } from './model';

import types, { AnyType, AnyOfType, ArrayOfType } from './types/types';


// field validator config
varValidator.enableScope = false;
varValidator.enableBrackets = false;

// schema id counter
let schemaCount = 0;



class PerfectSchema {

  /**
  Add a plugin to use with new instances of PerfectSchema. Added
  plugins do not affect currently instanciated instances.

  @param plugin {Function} a single function receiving the instance
  */
  static use(pluginFactory) {
    const plugin = pluginFactory(PerfectSchema)

    if (plugin) {
      if (typeof plugin === 'function') {
        PerfectSchema._plugins.push({
          init: plugin
        });
      } else {
        PerfectSchema._plugins.push(plugin);
      }
    }

    return PerfectSchema;
  }

  /**
  Create a new instance

  @param fields {Object} the fields definition (will be sanitized and normalized)
  @params options {Object} the schema options
  */
  constructor(fields, options = {}) {
    if (!fields || !Object.keys(fields).length) {
      throw new TypeError('No defined fields');
    } else if (typeof fields !== 'object') {
      throw new TypeError('Invalid fields argument');
    }

    PerfectSchema._plugins.forEach(plugin => plugin.preInit && plugin.preInit(this, fields, options));

    Object.defineProperties(this, {
      options: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: options
      },
      fields: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: normalizeValidators(fields, this)
      },
      fieldNames: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: Object.keys(fields)
      },
      _type: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: createType(this)
      }
    });

    PerfectSchema._plugins.forEach(plugin => plugin.init && plugin.init(this));

    this.fieldNames.forEach(field => Object.freeze(this.fields[field]));

    Object.freeze(this.fields);     // no further mods!
    Object.freeze(this.fieldNames); //
  }

  /**
  Create a new empty model from the fields' default values specification

  @return {Object}
  */
  createModel(data) {
    const model = createModel(this, data);

    PerfectSchema._plugins.forEach(plugin => plugin.extendModel && plugin.extendModel(model, this));

    return model;
  }

  /**
  Create a new validation context based on this schema
  */
  createContext() {
    const context = new ValidationContext(this);

    PerfectSchema._plugins.forEach(plugin => plugin.extendContext && plugin.extendContext(context, this));

    return context;
  }

}


// Bind default standard types
PerfectSchema.Any = AnyType;
PerfectSchema.ArrayOf = ArrayOfType;
PerfectSchema.AnyOf = AnyOfType;

// internal properties
Object.defineProperties(PerfectSchema, {
  _plugins: {
    enumerable: false,
    configurable: false,
    writable: false,
    value: []
  },
  _normalizeField: {
    enumerable: false,
    configurable: false,
    writable: false,
    value: normalizeField
  }
});


/**
Create a type for the given schema

@param schemaType {PerfectSchema}
@return {type}
*/
function createType(schemaType) {
  return {
    $$type: Symbol('schema' + (++schemaCount)),
    validatorFactory: (fieldName, field, schema, wrappedValidator) => {
      const validatorContext = schemaType.createContext();
      const validator = (value, options, context) => {
        if (!validatorContext.validate(value)) {
          return 'invalid';
        }

        return wrappedValidator && wrappedValidator(value, options, context);
      };

      validator.context = validatorContext;

      return validator;
    }
  };
}


/**
Sanitize all fields from the given object, make sure that each
key is a valid name, and that each type if a recognized validator

@param fields {object}
@param schema {PerfectSchema}
@return {Object}
*/
function normalizeValidators(fields, schema) {
  const fieldNames = Object.keys(fields);

  for (const fieldName of fieldNames) {
    if (!varValidator.isValid(fieldName)) {
      throw new Error('Invalid field name : ' + fieldName);
    }

    const field = fields[fieldName] = normalizeField(fields[fieldName], PerfectSchema);

    field.validator = field.type.validatorFactory(fieldName, field, schema, field.validator);
  }

  return fields;
}


/**
Return an object that is normalized with a valid type property

@param field
@param fieldName {String}   (optional) the field name
@return {Object}
*/
function normalizeField(field, fieldName) {
  if (!field) {
    throw new TypeError('Empty field specification' + (fieldName ? (' for ' + fieldName) : ''));
  } else if (!field.type) {
    field = { type: field };
  }

  if (field.type instanceof PerfectSchema) {
    field.type = field.type._type;
  } else {
    field.type = types.getType(field.type);

    if (!field.type) {
      throw new TypeError('Invalid field specification' + (fieldName ? (' for ' + fieldName) : ''));
    }
  }

  return field;
}



export default PerfectSchema;
