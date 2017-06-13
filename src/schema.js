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
    this._fields = normalizeFields(fields);
    this._validators = validatorBuilder(fields);

    checkDefaultValues(this._fields, this._validators);
  }


  /**
  Extends the current schema with more fields

  @param fields {Object}
  */
  extends(fields) {
    const fieldNames = Object.keys(fields);

    fields = normalizeFields(fields);

    for (var fieldName of fieldNames) {
      fields[fieldName] = this._fields[fieldName] = Object.assign(this._fields[fieldName] || {}, fields[fieldName]);
    }

    this._validators = Object.assign(this._validators, validatorBuilder(fields));
    this._fieldNames = Object.keys(this._fields);

    checkDefaultValues(fields, this._validators);
  }


  /**
  Create a new model instance for this schema

  @return {PerfectModel}
  */
  createModel() {
    const model = new PerfectModel(this);
    var defaultValue;

    for (var fieldName of this._fieldNames) {
      defaultValue = this._fields[fieldName].defaultValue;

      if (defaultValue) {
        model._data[fieldName] = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
      }
    }

    return model;
  }


  /**
  Validate the given data

  @param data {Object}                            the data to Validate
  @param parentCtx {validationContext} (optional) the parent validation context
  @return {ValidationResult}
  */
  validate(data, parentCtx) {
    if (parentCtx && !validationContext.isValidationContext(parentCtx)) {
      throw new TypeError('Invalid parent validation context');
    }
    const ctx = validationContext(data, parentCtx);
    const dataFields = Object.keys(data || {});
    const fields = this._fields;
    const fieldNames = this._fieldNames;
    const validators = this._validators;
    const messages = [];

    // Set initial state
    var isPending = true;
    const validationResults = [];

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


function isSchema(schema) {
  return schema && (schema instanceof PerfectSchema) || false;
}


function setDefaults(options) {
  if (options && (Object.prototype.toString.call(options) === '[object Object]')) {
    Object.assign(DEFAULT_OPTIONS, options);
  } else {
    throw new TypeError('Invalid options');
  }
}



PerfectSchema.isSchema = isSchema;
PerfectSchema.setDefaults = setDefaults;

module.exports = PerfectSchema;

const validatorBuilder = require('./validator-builder');
const validationContext = require('./validation-context');
const normalizeFields = require('./normalize-fields');
const PerfectModel = require('./model');
