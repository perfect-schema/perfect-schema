


export default class ValidationContext {

  constructor(schema) {
    Object.defineProperties(this, {
      schema: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: schema
      },
      _internals: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {
          valid: true,
          messages: {}
        }
      }
    });
  }

  isValid() {
    return this._internals.valid;
  }


  getMessages() {
    return Object.assign({}, this._internals.messages);
  }


  getMessage(field) {
    return this._internals.messages[field];
  }


  setMessage(field, message) {
    if (typeof field !== 'string') {
      throw new TypeError('Invalid field value');
    } else if (!(fieldPart(field, 0) in this.schema.fields)) {
      throw new Error('Unknown field : ' + field);
    } else if (message && (typeof message !== 'string')) {
      throw new TypeError('Invalid message for ' + field);
    } else if (message) {
      this._internals.messages[field] = message;
    } else {
      delete this._internals.messages[field];
    }

    this._internals.valid = !Object.keys(this._internals.messages).length;
  }


  reset() {
    this._internals.messages = {};
    this._internals.valid = true;
  }


  validate(value, options) {
    const { schema, _internals } = this;
    const { messages } = _internals;
    const { fieldNames, fields } = schema;
    const asyncValidations = [];

    options = options || {};

    // reset 'notInSchema' errors
    Object.keys(messages).forEach(fieldName => {
      if (!(fieldName in fields)) {
        delete messages[fieldName];
      }
    })

    // set 'notInSchema' errors
    Object.keys(value).forEach(propValue => {
      if (!(propValue in fields)) {
        messages[propValue] = 'notInSchema';
      }
    });

    fieldNames.forEach(fieldName => {
      const field = fields[fieldName];
      const propValue = value[fieldName];
      const result = field.validator(propValue, options, this);

      this.setMessage(fieldName, result);
    });

    return this.isValid();
  }

}


function fieldPart(fieldName, index){
  return fieldName.split('.')[index];
}
