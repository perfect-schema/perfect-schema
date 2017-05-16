/**
Object validation

Returns true if value is undefined, or an object. False otherwise.

@param options {Object}
@return {function}
*/
module.exports = function objectValidator(options) {
  /**
  Validate the given value

  @param value {mixed}
  @return {undefined|string}
  */
  return function validate(value) {
    if ((Object.prototype.toString.call(value) !== '[object Object]') && (value !== undefined)) {
      return 'invalidType';
    }
  };
};
