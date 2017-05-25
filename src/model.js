'use strict';
const normalizeFields = require('./normalize-fields');

const isSchema = normalizeFields.isSchema;


var idCounter = 0;


class PerfectModel {

  constructor(schema) {
    if (!isSchema(schema)) {
      throw new TypeError('Unspecified or invalid schema');
    }
    const ReactiveVar = schema._options.ReactiveVar || FakeReactiveVar;

    this._schema = schema;

    this._id = ++idCounter;
    this._data = {};
    this._valid = new ReactiveVar(true);
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
    var fieldName = pos > start ? field.substr(0, pos) : field;
    var fieldSpec = this._schema._fields[fieldName];
    var fieldValue;

    if (!fieldSpec) {
      throw new Error('Field not in schema : ' + fieldName);
    } else if (fieldName.length < field.length) {   // has more keys...
      fieldValue = this._data[fieldName];

      if (isSchema(fieldSpec.type)) {
        fieldValue = fieldValue && fieldValue.get(field.substr(pos + 1));
      } else if (isObject(fieldSpec.type)) {
        var _fieldName = fieldName;

        start = pos + 1;

        while (fieldValue && (pos = field.indexOf('.', start)) >= start) {
          _fieldName = field.substr(start, pos - start);
          fieldValue = fieldValue[_fieldName];
          start = pos + 1;
        }

        // when pos = -1, then we got all field parts, and start is the offset of the last field names
        fieldValue = pos === -1 ? fieldValue && fieldValue[field.substr(start)] : undefined;
      } else {
        throw new TypeError('Invalid type for field : ' + fieldName);
      }
    } else {
      fieldValue = this._data[fieldName];
    }

    return fieldValue;
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
    var fieldName = pos > start ? field.substr(0, pos) : field;
    var fieldSpec = this._schema._fields[fieldName];
    var fieldValue;

    if (!fieldSpec) {
      throw new Error('Field not in schema : ' + fieldName);
    } else if (fieldName.length < field.length) {   // has more keys...

      if (isSchema(fieldSpec.type)) {
        if (!(fieldName in this._data)) {
          fieldValue = this._data[fieldName] = fieldSpec.type.createModel();
        } else {
          fieldValue = this._data[fieldName];
        }

        fieldValue.set(field.substr(pos + 1), value);
      } else if (isObject(fieldSpec.type)) {
        var _fieldName = fieldName;
        var _fieldValue = fieldValue = this._data[fieldName] || (this._data[fieldName] = {});

        start = pos + 1;

        while ((pos = field.indexOf('.', start)) >= start) {
          _fieldName = field.substr(start, pos - start);
          _fieldValue = _fieldValue[_fieldName] || (_fieldValue[_fieldName] = {});
          start = pos + 1;
        }

        _fieldValue[field.substr(start)] = value;

        validate(this, fieldName);
      } else {
        throw new TypeError('Invalid type for field : ' + fieldName);
      }
    } else {
      fieldValue = this._data[fieldName] = value;

      validate(this, fieldName);
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



function isObject(type) {
  return type === Object;
}


function checkField(field) {
  if (typeof field !== 'string') {
    throw new TypeError('Invalid field type: expected string, received ' + typeof field);
  }
}

function validate(model, field) {
  const fields = Array.prototype.slice.call(arguments, 1);
  const schema = model._schema;
  const data = {};

  for (var i = 0, len = fields.length; i < len; ++i) {
    field = fields[i];

    data[field] = model._data[field];
  }

  schema.validate(data).then(messages => {

    /* TODO : update messages and invalidate model ReactiveVar */

  });
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
