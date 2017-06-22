

describe('Testing validators management', () => {
  const assert = require('assert');

  const validators = require('../src/validators');

  const field = 'test';


  it('should build typed validator', () => {
    const validator = validators.build(field, String);

    [
      '', 'hello'
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed to validate typed validator'));

    [
      null, true, false, NaN, -1, 0, 1,
      [], {}, /./, () => {}, new Date()
    ].forEach(value => assert.notStrictEqual(validator(value), undefined, 'Failed to invalidate typed validator'));
  });

  it('should register custom validator', () => {
    const testValidator = function (field, specs) {
      return function (value) {
        return value === 'test' ? undefined : 'error';
      };
    };

    validators.registerValidator(testValidator);

    const validator = validators.build(field, String);

    assert.strictEqual(validator('test'), undefined, 'Failed custom validator');

    [
      undefined, null, true, false, NaN, -1, 0, 1,
      [], {}, /./, () => {}, new Date(),
      'hello', '', 'world'
    ].forEach(value => assert.notStrictEqual(validator(value), undefined, 'Failed to invalidate typed validator'));
  });

  it('should only accept a function as validator', () => {
    [
      undefined, null, true, false, NaN, -1, 0, 1,
      [], {}, /./, new Date(),
      '', 'test'
    ].forEach(validator => assert.throws(() => validators.registerValidator(validator), 'Failed to throw with : ' + JSON.stringify(validator)));
  });

  it('should check that a validator returns a validation function', () => {
    [
      undefined, null, true, false, NaN, -1, 0, 1,
      [], {}, /./, new Date(),
      '', 'test'
    ].forEach(validator => assert.throws(() => validators.registerValidator(function () { return validator; }), 'Failed to throw with : ' + JSON.stringify(validator)));
  });


});
