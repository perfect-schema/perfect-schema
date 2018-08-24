


class ValidationContext {

  constructor(schema) {
    Object.defineProperties(this, {
      schema: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: schema
      },
      _messages: {
        enumerable: false,
        configurable: true,
        writable: true,
        value: {}
      },
      _valid: {
        enumerable: false,
        configurable: true,
        writable: true,
        value: true
      }
    });
  }

  isValid() {
    return this._valid;
  }


  getMessages() {
    return Object.assign({}, this._messages);
  }


  getMessage(field) {
    return this._messages[field];
  }


  setMessage(field, message) {
    if (typeof field !== 'string') {
      throw new TypeError('Invalid field value');
    } else if (!(fieldPart(field, 0) in this.schema.fields)) {
      throw new Error('Unknown field : ' + field);
    } else if (message && (typeof message !== 'string')) {
      throw new TypeError('Invalid message for ' + field);
    } else if (message) {
      this._messages[field] = message;
    } else {
      delete this._messages[field];
    }

    this._valid = !Object.keys(this._messages).length;
  }


  reset() {
    this._messages = {};
    this._valid = true;
  }


  validate(data, options = {}) {
    const { fieldNames, fields } = this.schema;
    const {
      fields: validateFieldNames,
      validatorOptions = {}
    } = options;

    // reset 'notInSchema' errors
    Object.keys(this._messages).forEach(fieldName => {
      if (this._messages[fieldName] === 'notInSchema') {
        delete this._messages[fieldName];
      }
    });

    // set 'notInSchema' errors
    (validateFieldNames || Object.keys(data)).forEach(fieldName => {
      if (!(fieldName in fields)) {
        this._messages[fieldName] = 'notInSchema';
      }
    });

    (validateFieldNames || fieldNames).forEach(fieldName => {
      const field = fields[fieldName];
      const value = data[fieldName];
      const result = field.validator(value, validatorOptions, this);

      if (result && (typeof result === 'string')) {
        this._messages[fieldName] = result;
      } else {
        Object.keys(this._messages).forEach(messageKey => {
          if (fieldPart(messageKey, 0) === fieldName) {
            delete this._messages[messageKey];
          }
        });
      }
    });

    return this._valid = !Object.keys(this._messages).length;
  }

}


function fieldPart(fieldName, index) {
  return fieldName.split('.')[index];
}


export default ValidationContext;
