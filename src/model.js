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
  }

  /**
  Return the error messages for the specified field. The field
  may be a dot-separated path of field names for recursive models.

  @param field {string}
  @return {string}
  */
  getMessages(field) {
    const fieldMessages = [];
    var message;

    for (var i = 0, iLen = this._messages && this._messages.length || 0; i < iLen; ++i) {
      message = this._messages[i];

      if (message.field === field) {
        fieldMessages.push(message);
      }
    }

    return fieldMessages.length ? fieldMessages : null;
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
  @return {Promise}
  */
  set(field, value) {
    const schema = this._schema;
    const data = this._data;
    const dataTS = this._dataTS;

    function setField(field, value) {
      checkField(field);

      var start = 0;
      var pos = field.indexOf('.', start);
      var fieldName = pos > start ? field.substr(0, pos) : field;
      var fieldTS = dataTS[fieldName] || (dataTS[fieldName] = {});
      var fieldSpec = schema._fields[fieldName];
      var fieldValue;

      if (!fieldSpec) {
        throw new Error('Field not in schema : ' + fieldName);
      } else if (fieldName.length < field.length) {   // has more keys...

        if (isSchema(fieldSpec.type)) {
          if (!(fieldName in data)) {
            fieldValue = data[fieldName] = fieldSpec.type.createModel();
          } else {
            fieldValue = data[fieldName];
          }

          fieldTS.set = present();
          return fieldValue.set(field.substr(pos + 1), value).then(() => fieldName);
        } else if (isObject(fieldSpec.type)) {
          var _fieldName = fieldName;

          fieldValue = data[fieldName] || (data[fieldName] = {});

          start = pos + 1;

          while ((pos = field.indexOf('.', start)) >= start) {
            _fieldName = field.substr(start, pos - start);
            fieldValue = fieldValue[_fieldName] || (fieldValue[_fieldName] = {});
            start = pos + 1;
          }

          fieldTS.set = present();
          fieldValue[field.substr(start)] = value;
        } else {
          throw new TypeError('Invalid type for field : ' + fieldName);
        }
      } else {
        fieldTS.set = present();

        if (isSchema(fieldSpec.type)) {
          if (!(fieldName in data)) {
            fieldValue = data[fieldName] = fieldSpec.type.createModel();
          } else {
            fieldValue = data[fieldName];
          }

          return fieldValue.set(value).then(() => fieldName);
        } else {
          data[fieldName] = value;
        }
      }

      return Promise.resolve(fieldName);
    }

    if (arguments.length === 1 && (Object.prototype.toString.call(field) === '[object Object]')) {
      return Promise.all(Object.keys(field).map(fieldName => {
        return setField(fieldName, field[fieldName]);
      })).then(fieldNames => {
        return validate(this, fieldNames);
      });
    } else {
      return setField(field, value).then(fieldName => {
        return validate(this, [fieldName]);
      });
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
  Validate all the fields that have not been validated, yet.
  Useful to make sure all the fields are valid. Use set(field, value)
  to validate a specific field.

  @return {Promise}
  */
  validate() {
    const dataTS = this._dataTS;
    const fieldNames = this._schema._fieldNames;
    const validateFields = [];
    var fieldName, fieldTS;

    for (fieldName of fieldNames) {
      fieldTS = dataTS[fieldName];

      if (!fieldTS || !fieldTS.validating) {
        validateFields.push(fieldName);
      }
    }

    return validate(this, validateFields);
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

function validate(model, fieldNames) {
  const validationTS = present();
  const schema = model._schema;
  const data = model._data;
  const dataTS = model._dataTS;
  const messages = model._messages;
  const validationData = {};
  const fieldNamesLen = fieldNames && fieldNames.length || 0;
  var fieldName, msgFieldName;

  for (var i = 0; i < fieldNamesLen; ++i) {
    fieldName = fieldNames[i];

    dataTS[fieldName] = dataTS[fieldName] || {};
    dataTS[fieldName].validating = validationTS;

    validationData[fieldName] = data[fieldName];
  }

  return schema.validate(validationData).then(validationMessages => {
    const validatedTS = present();
    const validationMsgLen = validationMessages && validationMessages.length || 0;
    var messagesLen = messages.length || 0;
    var duplicate, fieldTS, i, j, msg;

    for (i = 0; i < fieldNamesLen; ++i) {
      fieldName = fieldNames[i];
      fieldTS = dataTS[fieldName];

      for (j = messagesLen - 1; j >= 0; --j) {
        msg = messages[j];

        if ((msg.field === fieldName) && (!fieldTS || (fieldTS.set < validationTS))) {
          messages.splice(j, 1);
          --messagesLen;
        }
      }
    }

    for (i = 0; i < validationMsgLen; ++i) {
      msg = validationMessages[i];
      fieldTS = dataTS[msg.field] || (dataTS[msg.field] = {});

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

    return model._messages = messages;
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


function isModel(model) {
  return model && (model instanceof PerfectModel) || false;
}



PerfectModel.isModel = isModel;


module.exports = PerfectModel;


const present = require('present');
const PerfectSchema = require('./schema');

const isSchema = PerfectSchema.isSchema;
