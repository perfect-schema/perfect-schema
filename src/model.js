'use strict';
const normalizeFields = require('./normalize-fields');

const isSchema = normalizeFields.isSchema;


var idCounter = 0;


class PerfectModel {

  constructor(schema) {
    if (!isSchema(schema)) {
      throw new TypeError('Unspecified schema');
    }
    const ReactiveVar = schema._options.ReactiveVar || FakeReactiveVar;

    this._schema = schema;

    this._id = ++idCounter;
    this._data = {};
    this._valid = new ReactiveVar(false);
    this._errorMessages = {};
  }

  /**
  Retrieve the field value. The field may be a dot-separated path
  of field names for recursive models

  @param field {string}
  @return {mixed}
  */
  get(field) {
    checkField(field);

    var start = 0;
    var pos = field.indexOf('.', start);
    var fieldName = pos > start ? field.substr(0, pos) : '';
    var fieldSpec = schema._fields[fieldName];

    if (!fieldSpec) {
      throw new Error('Field not in schema : ' + fieldName + ' (' + field + ')');
    } else if (fieldName.length < field.length) {   // has more keys...
      // TODO : check if fieldSpec is an object

      var value = this._data[fieldName];

      while (value && (pos = field.indexOf('.', start = pos + 1)) >= start) {
        fieldName = field.substr(start, pos);

        value = value[fieldName];
      }

      return value;
    } else {
      return this._data[fieldName];
    }
  }

  /**
  Set the given value to the specified field. The field may be a dot-separated
  path of field names for recursive models.

  @param field {string}
  @param value {mixed}
  */
  set(field, value) {
    checkField(field);

    var start = 0;
    var pos = field.indexOf('.', start);
    var fieldName;
    var value = this._data;

    while (pos !== -1) {
      fieldName = field.substr(start, pos);
      value = value[fieldName];

      if (typeof value.get === 'function') {
        value = value.get(field.substr(start));
        break;
      }

      pos = field.indexOf('.', start = pos + 1);
    }


  }

  /**
  Returns true if this model is valid

  @return {boolean}
  */
  isValid() {
    return this._valid.get();
  }

  /**
  Return the error message for the specified field. The field
  may be a dot-separated path of field names for recursive models.

  @param field {string}
  @return {string}
  */
  getMessage(field) {
    return false;
  }

}


function checkField(field) {
  if (typeof field !== 'string') {
    throw new TypeError('Invalid field type: expected string, received ' + typeof field);
  }
}

function validate(value, validator, model) {

}


function FakeReactiveVar(value) {
  this.get = function getValue() {
    return value;
  };
  this.set = function setValue(newValue) {
    value = newValue;
  };
}



module.exports = PerfectModel;
