


export default class ValidationContext {

  constructor(schema, options) {
    const { parentContext, parentField } = options || {};
    let valid = true;

    Object.defineProperties(this, {
      schema: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: schema
      },
      parentContext: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: parentContext || undefined
      },
      parentField: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: parentField || undefined
      },
      messages: {
        enumerable: true,
        configurable: false,
        writable: true,
        value: {}
      },
      isValid: {
        enumerable: true,
        configurable: true,
        get() { return valid; },
        set(v) { valid = v; }
      }
    });
  }


  setMessage(field, message) {
    if (typeof field !== 'string') {
      throw new TypeError('Invalid field value');
    } else if (!(field in this.schema.fields)) {
      throw new Error('Unknown field : ' + field);
    } else if (message && (typeof message !== 'string')) {
      throw new TypeError('Invalid message for ' + field);
    } else if (message) {
      this.messages[field] = message;
    } else {
      delete this.messages[field];
    }

    const valid = !Object.keys(this.messages).length;

    this.isValid = valid;

    if (this.parentContext && this.parentField) {
      this.parentContext.setMessage(this.parentField, valid ? 'invalid' : null);
    }
  }


  reset() {
    this.messages = {};
    this.isValid = true;
  }


  validate(value, options) {
    const { schema, messages } = this;
    const { fieldNames, fields } = schema;
    const { validatorOptions } = options || {};
    const asyncValidations = [];
    let result;

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

      try {
        result = field.validator(propValue, validatorOptions, this);
      } catch (e) {
        result = 'error';
      }

      if (result instanceof Promise) {
        asyncValidations.push(result.then(result => {
          this.setMessage(fieldName, result);
        }, () => {
          this.setMessage(fieldName, 'error')
          throw new Error('Validation error : ' + fieldName);
        }));
      } else {
        this.setMessage(fieldName, result);
      }
    });

    return Promise.all(asyncValidations).then(() => schema.isValid);
  }

}
