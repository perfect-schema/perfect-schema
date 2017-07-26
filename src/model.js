'use strict';

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
    this._dataTS = {};
    this._valid = new ReactiveVar(true);
    this._messages = [];

    setDefaults(this, schema);
  }

  /**
  Return the error messages for the specified field. The field
  may be a dot-separated path of field names for recursive models.

  @param field {String}
  @return {string}
  */
  getMessages() {
    const fields = arguments;

    if (fields.length) {
      const fieldMessages = [];
      var message;

      for (var field of fields) {
        for (var i = 0, iLen = this._messages && this._messages.length || 0; i < iLen; ++i) {
          message = this._messages[i];

          if (message.field === field) {
            fieldMessages.push(message);
          }
        }
      }

      return fieldMessages.length ? fieldMessages : null;
    } else {
      return this._messages.length ? this._messages : null;
    }
  }

  /**
  Retrieve the field value. The field may be a dot-separated path
  of field names for recursive models

  @param field {String}
  @return {mixed}
  */
  get(field) {
    checkField(field);

    var start = 0;
    var pos = field.indexOf('.', start);
    var fieldName = pos > start ? field.substr(0, pos) : field;
    var fieldType = getFieldType(this._schema._fields[fieldName]);
    var fieldValue;

    if (!fieldType) {
      throw new Error('Field not in schema : ' + fieldName);
    } else if (fieldName.length < field.length) {   // has more keys...
      fieldValue = this._data[fieldName];

      if (isSchema(fieldType)) {
        fieldValue = ensureModel(fieldValue, fieldType).get(field.substr(pos + FIELD_SEPARATOR_LEN));
      } else {
        start = pos + FIELD_SEPARATOR_LEN;

        while (fieldValue && (pos = field.indexOf('.', start)) >= start) {
          fieldName = field.substr(start, pos - start);
          fieldValue = fieldValue[fieldName];
          start = pos + FIELD_SEPARATOR_LEN;
        }

        // when pos = -1, then we got all field parts, and start is the offset of the last field names
        fieldValue = pos === -1 ? fieldValue && fieldValue[field.substr(start)] : undefined;
      }
    } else {
      fieldValue = this._data[fieldName];

      if (isSchema(fieldType)) {
        fieldValue = ensureModel(fieldValue, fieldType);
      }
    }

    return fieldValue;
  }

  /**
  Return all the raw data from this model

  @return {Object}
  */
  getData() {
    const data = {};
    const d = this._data;
    var value;

    Object.keys(d).forEach(key => {
      value = d[key];

      if (value instanceof Array) {
        data[key] = value.map(value => isModel(value) ? value.getData() : value);
      } else {
        data[key] = isModel(value) ? value.getData() : value;
      }
    });

    return data;
  }

  /**
  Set the given value to the specified field. The field may be a dot-separated
  path of field names for recursive models.

  @param field {String}
  @param value {mixed}
  @return {Promise}
  */
  set(field, value) {
    const schema = this._schema;
    const data = this._data;
    const dataTS = this._dataTS;

    function setField(field, value) {
      checkField(field);

      var start = 0;
      var pos = field.indexOf(FIELD_SEPARATOR, start);
      var fieldName = pos > start ? field.substr(0, pos) : field;
      var fieldTS = dataTS[fieldName] || (dataTS[fieldName] = {});
      var fieldType = getFieldType(schema._fields[fieldName]);
      var fieldValue;

      if (!fieldType) {
        throw new Error('Field not in schema : ' + fieldName);
      } else if (fieldName.length < field.length) {   // has more keys...

        if (isSchema(fieldType)) {
          if (!(fieldName in data)) {
            fieldValue = data[fieldName] = fieldType.createModel();
          } else {
            fieldValue = data[fieldName];
          }

          fieldTS.set = present();
          return fieldValue.set(field.substr(pos + FIELD_SEPARATOR_LEN), value).then(() => fieldName);
        } else if (fieldType === Object) {
          var _fieldName = fieldName;

          fieldValue = data[fieldName] || (data[fieldName] = {});

          start = pos + FIELD_SEPARATOR_LEN;

          while ((pos = field.indexOf(FIELD_SEPARATOR, start)) >= start) {
            _fieldName = field.substr(start, pos - start);
            fieldValue = fieldValue[_fieldName] || (fieldValue[_fieldName] = {});
            start = pos + FIELD_SEPARATOR_LEN;
          }

          fieldTS.set = present();
          fieldValue[field.substr(start)] = value;
        } else {
          throw new TypeError('Invalid type for field : ' + fieldName);
        }
      } else {
        fieldTS.set = present();

        if (isSchema(fieldType)) {
          if (isModel(value) || (Object.prototype.toString.call(value) !== '[object Object]')) {
            data[fieldName] = value;
          } else {
            fieldValue = data[fieldName];

            if (!isModel(fieldValue)) {
              fieldValue = data[fieldName] = fieldType.createModel();
            }

            return fieldValue.set(value).then(() => fieldName);
          }
        } else {
          data[fieldName] = value;
        }
      }

      return fieldName;
    }

    if (isModel(field)) {
      field = field.getData();
    }

    if (arguments.length === 1 && (Object.prototype.toString.call(field) === '[object Object]')) {
      // if (isModel(field)) { field = field._data; }
      return Promise.all(Object.keys(field).map(fieldName => setField(fieldName, field[fieldName]))).then(fieldNames => validate(this, fieldNames));
    } else {
      return Promise.resolve(setField(field, value)).then(fieldName => validate(this, [fieldName]));
    }
  }


  /**
  Returns true if this model is valid

  @return {Boolean}
  */
  isValid() {
    return this._valid.get();
  }

  /**
  Validate all the fields that have not been validated, yet.
  Useful to make sure all the fields are valid. Use set(field, value)
  to validate a specific field.

  If allFields is an array, it is the explicit list of fields to validate. If
  any array element is not a recognized field, an error will be thrown.

  If allFields is an object, then all keys that are truthy are the fields to
  validate. If any key is not a recognized field, an error will be thrown.

  If allFields is any other value, all fields will be validated.

  @param allFields {Object|Array}    (optional) validate all fields
  @return {Promise}
  */
  validate(allFields) {
    const dataTS = this._dataTS;
    const fields = this._schema._fields;
    const fieldNames = this._schema._fieldNames;
    const validateFields = [];
    var fieldName, fieldTS;

    if (allFields === true) {
      validateFields.push.apply(validateFields, fieldNames);
    } else if (allFields instanceof Array) {
      for (fieldName of allFields) {
        if (!(fieldName in fields)) {
          throw new TypeError('Unknown field : ' + fieldName);
        }
        validateFields.push(fieldName);
      }
    } else if (Object.prototype.toString.call(allFields) === '[object Object]') {
      const keys = Object.keys(allFields);

      for (fieldName of keys) {
        if (allFields[fieldName]) {
          if (!(fieldName in fields)) {
            throw new TypeError('Unknown field : ' + fieldName);
          }
          validateFields.push(fieldName);
        }
      }
    } else {
      for (fieldName of fieldNames) {
        fieldTS = dataTS[fieldName];

        if (!fieldTS || (!fieldTS.validating && (fieldTS.validated < fieldTS.set))) {
          validateFields.push(fieldName);
        }
      }
    }

    if (validateFields.length) {
      return validate(this, validateFields);
    } else {
      return Promise.resolve(this);
    }
  }

}

function isModel(model) {
  return model && (model instanceof PerfectModel) || false;
}

function ensureModel(value, schema) {
  const data = value;

  if (value && (Object.prototype.toString.call(value) === '[object Object]') && !isModel(value)) {
    value = schema.createModel();
    value.set(data);
  }

  return value;
}


function checkField(field) {
  if (typeof field !== 'string') {
    throw new TypeError('Invalid field type: expected string, received ' + typeof field);
  }
}

function getFieldType(specs) {
  return specs && getUserType(specs.type || specs);
}

function setDefaults(model, schema) {
  const fieldNames = schema._fieldNames;
  const fields = schema._fields;
  const data = model._data;
  var defaultValue, field, fieldName;

  for (fieldName of fieldNames) {
    field = fields[fieldName];
    if ((Object.prototype.toString.call(field) === '[object Object]') && ('defaultValue' in field)) {
      defaultValue = field.defaultValue;
      data[fieldName] = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
  }
}

function validate(model, fieldNames) {
  const validationTS = present();
  const schema = model._schema;
  const data = model._data;
  const dataTS = model._dataTS;
  const messages = model._messages;
  const context = validationContext(data);
  const validationData = {};
  const fieldNamesLen = fieldNames && fieldNames.length || 0;
  var fieldName;

  for (var i = 0; i < fieldNamesLen; ++i) {
    fieldName = fieldNames[i];

    dataTS[fieldName] = dataTS[fieldName] || {};
    dataTS[fieldName].validating = validationTS;

    validationData[fieldName] = data[fieldName];
  }

  return schema.validate(validationData, context).then(validationMessages => {
    const validatedTS = present();
    const validationMsgLen = validationMessages && validationMessages.length || 0;
    var messagesLen = messages.length || 0;
    var duplicate, fieldMsgFound, fieldTS, i, j, msg;

    for (i = 0; i < fieldNamesLen; ++i) {
      fieldName = fieldNames[i];
      fieldTS = dataTS[fieldName];
      fieldMsgFound = false;

      for (j = 0; j < validationMsgLen; ++j) {
        msg = validationMessages[j];
        if (msg.field === fieldName) {
          fieldMsgFound = true;
        }
      }

      for (j = messagesLen - 1; j >= 0; --j) {
        msg = messages[j];

        if ((msg.field === fieldName) && (!fieldMsgFound || !fieldTS || (fieldTS.set < validationTS))) {
          messages.splice(j, 1);
          --messagesLen;
        }
      }
    }

    for (i = 0; i < validationMsgLen; ++i) {
      msg = validationMessages[i];
      fieldTS = dataTS[msg.field]; // || (dataTS[msg.field] = {});

      if (!fieldTS.set || (fieldTS.set <= validationTS)) {
        // try to find if the same message was already set
        duplicate = false;
        fieldTS.validated = msg.ts = validatedTS;
        fieldTS.validating = false;

        for (j = 0; j < messagesLen; ++j) {
          if ((messages[j].field === msg.field) && (messages[j].message === msg.message)) {
            duplicate = true;

            messages[j] = msg;
            break;
          }
        }

        if (!duplicate) {
          messages.push(msg);
          ++messagesLen;
        }
      }
    }

    model._valid.set(!messages.length);

    return model;
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


PerfectModel.isModel = isModel;

module.exports = PerfectModel;

const present = require('present');

const Schema = require('./schema');
const isSchema = Schema.isSchema;

const types = require('./validators/types');
const getUserType = types.getRegisteredType;

const c = require('./constents');
const FIELD_SEPARATOR = c.FIELD_SEPARATOR;
const FIELD_SEPARATOR_LEN = c.FIELD_SEPARATOR_LEN;

const validationContext = require('./validation-context');
