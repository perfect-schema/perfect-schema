


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
    } else if (!(field.split('.')[0] in this.schema.fields)) {
      throw new Error('Unknown field : ' + field + ' (' + this.schema.fieldNames.join(', ') + ')');
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

    if (typeof data !== 'object') {
      throw new TypeError('Data must be an object');
    }

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
      Object.keys(this._messages).forEach(messageKey => {
        if (messageKey.split('.')[0] === fieldName) {
          delete this._messages[messageKey];
        }
      });

      const field = fields[fieldName];
      const value = data[fieldName];
      const self = {
        fieldName,
        options: validatorOptions,
        getField(fieldName) {
          const path = typeof fieldName === 'string' ? fieldName.split('.') : undefined;
          let value = data;
          let exists = true;

          if (!path) {
            throw new TypeError('Invalid fieldName');
          }

          for (let index = 0, len = path.length; index < len; ++index) {
            if (value && (typeof value === 'object') && (path[index] in value)) {
              value = value[path[index]];
            } else {
              value = undefined;
              exists = false;
            }
          }

          return { exists, value };
        },
        getSibling(fieldName) {
          console.warn("Deprecated, use getField instead");
          return this.getField(fieldName);
        }
      };
      const result = field.validator(value, self, this);

      if (result && (typeof result === 'string')) {
        this._messages[fieldName] = result;
      }
    });

    return this._valid = !Object.keys(this._messages).length;
  }

}


export default ValidationContext;
