'use strict';

const validatorBuilder = require('./validator-builder');
const normalizeFields = require('./normalize-fields').normalizeFields;
const IntegerType = require('./validators/integer').Type;
const any = require('./any');
const PerfectModel = require('./model');


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

    this._validators = Object.assign(this._validators || {}, validatorBuilder(fields));
    this._fieldNames = Object.keys(this._fields);
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
    var isRejected = false;
    var isFulfilled = false;
    const validationResults = [];

    function validateField(fieldName, value) {
      const validator = validators[fieldName];

      return Promise.resolve(validator(value)).then(message => {
        if (typeof message === 'string') {
          messages.push({ fieldName: fieldName, message: message, value: value });
        } else if (message && (Object.prototype.toString.call(message) !== '[object Object]')) {
          for (var msg of message) {
            msg.fieldName = fieldName + '.' + msg.fieldName;
            messages.push(msg);
          }
        }
      });
    }

    for (var fieldName of dataFields) {
      if (!(fieldName in fields)) {
        messages.push({ fieldName: fieldName, message: 'keyNotInSchema' });
      } else {
        validationResults.push(validateField(fieldName, data[fieldName]));
      }
    }

    const promise = Promise.all(validationResults).then(() => {
      isFulfilled = true;
      isPending = false;
      return messages;
    }, (error) => {
      isRejected = true;
      isPending = false;
      throw error;
    });

    promise.isFulfilled = function isFulfilled() { return isFulfilled; };
    promise.isPending = function isPending() { return isPending; };
    promise.isRejected = function isRejected() { return isRejected; };
    promise.getMessages = function getMessages() { return messages; };

    return promise;
  }

}

PerfectSchema.any = any;
PerfectSchema.Integer = IntegerType;



module.exports = PerfectSchema;
