'use strict';

class PerfectSchema {

  /**
  Create a new instance of PerfectSchema

  @param fields {Object}
  */
  constructor(fields, options) {
    if (typeof fields !== 'object') { throw new TypeError('Fields must be an object'); }

    this._fieldNames = Object.keys(fields);

    if (!this._fieldNames.length) { throw new TypeError('No fields specified'); }

    this._fields = normalizeFields(fields);
    this._validators = validatorBuilder(fields);
    this._options = options || {};
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
  }


  /**
  Create a new model instance for this schema

  @return {PerfectModel}
  */
  createModel(data) {
    const model = new PerfectModel(this);

    data && model.set(data);

    return model;
  }


  /**
  Validate the given data

  @param data {Object}    the data to Validate
  @return {ValidationResult}
  */
  validate(data) {
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
        return Promise.resolve(validator(value)).then(message => {
          if (typeof message === 'string') {
            messages.push({ fieldName: fieldName, message: message, value: value });
          } else if (message && Array.isArray(message) && message.length) {
            messages.push({ fieldName: fieldName, message: 'invalid' });
          }
        }, error => {
          messages.push({ fieldName: fieldName, message: 'error', value: value, error: error });
        });
      } catch (error) {
        messages.push({ fieldName: fieldName, message: 'error', value: value, error: error });
      }
    }

    for (var fieldName of dataFields) {
      if (!(fieldName in fields)) {
        messages.push({ fieldName: fieldName, message: 'keyNotInSchema', value: data[fieldName] });
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


function isSchema(schema) {
  return schema && (schema instanceof PerfectSchema);
}


PerfectSchema.isSchema = isSchema;

module.exports = PerfectSchema;

const validatorBuilder = require('./validator-builder');
const normalizeFields = require('./normalize-fields');
const PerfectModel = require('./model');
