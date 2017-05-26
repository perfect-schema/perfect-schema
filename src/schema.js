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
    var done = false;

    const promise = Promise.resolve(() => {
      const validationResults = [];

      function validateField(fieldName, value) {
        const validator = validators[fieldName];

        return Promise.resolve(validator(value)).then(message => {
          if (message) {
            messages.push({ fieldName: fieldName, message: message, value: value });
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

      return Promise.all(validationResults);
    }).then(() => {
      done = true;
      return messages;
    });

    return {
      isDone() {
        return done;
      },
      isValid() {
        return done ? !errors.length : false;
      },
      errorMessages() {
        return messages;
      },
      validationPromise() {
        return promise;
      }
    };
  }

}

PerfectSchema.any = any;
PerfectSchema.Integer = IntegerType;



module.exports = PerfectSchema;
