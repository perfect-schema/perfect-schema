/*eslint no-unused-vars: "off"*/
/*eslint no-console: "off"*/

'use strict';

const DEFAULT_OPTIONS = {};


class PerfectSchema {

  /**
  Create a new instance of PerfectSchema

  @param fields {Object}
  */
  constructor(fields, options) {
    if (typeof fields !== 'object') { throw new TypeError('Fields must be an object'); }

    this._fieldNames = Object.keys(fields);

    if (!this._fieldNames.length) { throw new TypeError('No fields specified'); }

    this._options = Object.assign({}, DEFAULT_OPTIONS, options || {});
    this._fields = fields;
    this._validators = {};

    // register schema as type before validating anything
    registerSchemaType(this);

    for (var fieldName of this._fieldNames) {
      this._validators[fieldName] = validators.build(fieldName, fields[fieldName]);
    }

    checkDefaultValues(this._fields, this._validators);
  }


  /**
  Extends the current schema with more fields

  @param fields {Object}
  */
  extend(fields) {
    const fieldNames = Object.keys(fields);
    var field;

    for (var fieldName of fieldNames) {
      if (fields[fieldName] === Object) {
        field = this._fields[fieldName] = Object.assign(this._fields[fieldName] || {}, { type: Object });
      } else {
        field = this._fields[fieldName] = Object.assign(this._fields[fieldName] || {}, fields[fieldName]);
      }

      this._validators[fieldName] = validators.build(fieldName, field);
    }

    this._fieldNames = Object.keys(this._fields);

    checkDefaultValues(fields, this._validators);
  }


  /**
  Create a new model instance for this schema

  @return {PerfectModel}
  */
  createModel() {
    return new PerfectModel(this);
  }


  /**
  Validate the given data

  @param data {Object}                            the data to Validate
  @param context {validationContext}   (optional) the validation context
  @return {ValidationResult}
  */
  validate(data, context) {
    if (context && !validationContext.isValidationContext(context)) {
      throw new TypeError('Invalid parent validation context');
    }
    const ctx = context || validationContext(data);
    const dataFields = Object.keys(data || {});
    const fields = this._fields;
    const validators = this._validators;
    const messages = [];

    const validationResults = [];
    // Set initial state
    var isPending = true;

    function validateField(fieldName, value) {
      const validator = validators[fieldName];

      try {
        return Promise.resolve(validator(value, ctx)).then(message => {
          if (message) {
            messages.push({ field: fieldName, message: message, value: value });
          }
        }, error => {
          messages.push({ field: fieldName, message: 'error', value: value, error: error });
        });
      } catch (error) {
        messages.push({ field: fieldName, message: 'error', value: value, error: error });
      }
    }

    for (var fieldName of dataFields) {
      if (!(fieldName in fields)) {
        messages.push({ field: fieldName, message: 'keyNotInSchema', value: data[fieldName] });
      } else {
        validationResults.push(validateField(fieldName, data[fieldName]));
      }
    }

    const promise = Promise.all(validationResults).then(() => {
      isPending = false;
      return messages;
    });  // note errors are handled inside the validateField function, so there should not be any errors at this point

    promise.isPending = function isPending() { return isPending; };
    promise.getMessages = function getMessages() { return messages; };

    return promise;
  }

}


function registerSchemaType(schema) {
  const options = schema._options;
  const typeName = 'name' in options ? [options.name] : undefined;

  function validator(/*field, specs*/) {
    return function schemaValidator(value, ctx) {
      if (isModel(value)) {
        if (value._schema === schema) {
          return schema.validate(value._data, validationContext(value._data, ctx)).then(messages => {
            if (messages.length) {
              return 'invalid';
            }
          });
        }
      } else if (Object.prototype.toString.call(value) === '[object Object]') {
        return schema.validate(value, validationContext(value, ctx)).then(messages => {
          if (messages.length) {
            return 'invalid';
          }
        });
      }
      if (value !== undefined) {
        return 'invalidType';
      }
    }
  }

  types.registerType(schema, validator, typeName);
}


function checkDefaultValues(fields, validators) {
  const fieldNames = Object.keys(fields);
  var defaultValue;
  var value;

  for (var fieldName of fieldNames) (function (fieldName) {
    defaultValue = fields[fieldName].defaultValue;

    if (defaultValue) {
      value = typeof defaultValue === 'function' ? defaultValue(true) : defaultValue;

      Promise.resolve(validators[fieldName](value)).then(message => {
        if (message) {
          console.warn('Warning! Default value did not validate for field : ' + fieldName + ', message = ' + message);
        }
      }, error => {
        console.warn("Error while validating default value for field : " + fieldName);
        console.warn(error);
      });
    }
  })(fieldName);
}



function setDefaults(options) {
  if (options && (Object.prototype.toString.call(options) === '[object Object]')) {
    Object.assign(DEFAULT_OPTIONS, options);
  } else {
    throw new TypeError('Invalid options');
  }
}


function isSchema(schema) {
  return schema && (schema instanceof PerfectSchema) || false;
}


PerfectSchema.setDefaults = setDefaults;
PerfectSchema.isSchema = isSchema;

module.exports = PerfectSchema;

const types = require('./validators/types');
const validators = require('./validators');
const validationContext = require('./validation-context');
const PerfectModel = require('./model');

const isModel = PerfectModel.isModel;
