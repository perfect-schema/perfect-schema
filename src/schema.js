import ValidationContext from './context';
import { normalizeFields } from './fields-normalizer';
import { createModel } from './model';

import Any from './types/any';
import ArrayOf from './types/array-of';
//import OneOf from './types/one-of';


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
      if (typeof plugin !== 'function') {
        throw new TypeError('Plugin factory did return something, but a function was expected : ' + plugin);
      }

      PerfectSchema._plugins.push(plugin);
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
        value: normalizeFields(fields, this, PerfectSchema)
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

    PerfectSchema._plugins.forEach(plugin => plugin(this));

    this.fieldNames.forEach(field => Object.freeze(this.fields[field]));

    Object.freeze(this.fields);     // no further mods!
    Object.freeze(this.fieldNames); //
  }

  /**
  Create a new empty model from the fields' default values specification

  @return {Object}
  */
  createModel(data) {
    return createModel(this, data);
  }

  /**
  Create a new validation context based on this schema
  */
  createContext() {
    return new ValidationContext(this);
  }

}


// Bind default standard types
PerfectSchema.Any = Any;
PerfectSchema.ArrayOf = ArrayOf;
//PerfectSchema.OneOf = OneOf;

// internal properties
Object.defineProperties(PerfectSchema, {
  _plugins: {
    enumerable: false,
    configurable: false,
    writable: false,
    value: []
  },
});


function createType(schemaType) {
  return {
    $$type: 'schema' + (++schemaCount),
    validatorFactory: function (fieldName, field, schema, wrappedValidator) {
      const validatorContext = schemaType.createContext();
      const validator = (value, options, context) => {
        validatorContext.validate(value);

        if (!validatorContext.isValid()) {
          return 'invalid';
        }

        return wrappedValidator && wrappedValidator(value, options, context);
      };

      validator.context = validatorContext;

      return validator;
    }
  };
}


export default PerfectSchema;
