function validationContext(data, parent) {
  data = data || {};

  return {
    field(fieldName) {
      const fieldContext = {
        value: data,
        exists: true
      };

      if ((typeof fieldName !== 'string') || !fieldName.length) {
        throw new TypeError('Invalid field name');
      } else {
        var start = 0;
        var end = fieldName.indexOf(FIELD_SEPARATOR);

        if (end > -1) {
          var field;

          while ((end > -1) && fieldContext.exists) {
            field = fieldName.substring(start, end);

            setContextValue(fieldContext, field);

            start = end + FIELD_SEPARATOR_LEN;
            end = fieldName.indexOf(FIELD_SEPARATOR, start);
          }

          if (fieldContext.exists) {
            setContextValue(fieldContext, fieldName.substring(start));
          }
        } else {
          setContextValue(fieldContext, fieldName);
        }
      }

      return fieldContext;
    },

    parent() {
      return parent;
    }
  };
}


function setContextValue(ctx, field) {
  const data = isModel(ctx.value) ? ctx.value._data : ctx.value;

  ctx.exists = (Object.prototype.toString.call(data) === '[object Object]') && (field in data);

  if (ctx.exists) {
    ctx.value = data[field];
  } else {
    ctx.value = undefined;
  }

  return ctx.exists;
}


function isValidationContext(ctx) {
  return ctx && (typeof ctx.field === 'function') && (typeof ctx.parent === 'function');
}


validationContext.isValidationContext = isValidationContext;


module.exports = validationContext;


const isModel = require('./model').isModel;

const c = require('./constents');
const FIELD_SEPARATOR = c.FIELD_SEPARATOR;
const FIELD_SEPARATOR_LEN = c.FIELD_SEPARATOR_LEN;
