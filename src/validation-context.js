'use strict';

module.exports = function validationContext(data, parent) {
  data = data || {};

  return {
    field(fieldName) {
      var value = undefined;
      var exists = true;

      if (fieldName in data) {
        value = getFieldValue(data[fieldName]);
      } else if ((typeof fieldName === 'string') && (fieldName.indexOf('.') > -1)) {
        const fieldNames = fieldName.split('.');

        value = data;

        for (fieldName of fieldNames) {
          if (value && (fieldName in value)) {
            value = getFieldValue(value[fieldName]);
          } else {
            value = undefined;
            exists = false;
            break;
          }
        }
      } else {
        value = undefined;
        exists = false;
      }

      return {
        value: value,
        exists: exists
      };
    },

    parent() {
      return parent;
    }
  };
};


function getFieldValue(value) {
  if (isModel(value)) {
    return value._data;
  } else {
    return value;
  }
}


const Model = require('./model');

const isModel = Model.isModel;
