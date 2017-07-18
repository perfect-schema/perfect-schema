
describe('Testing allowed values validator', () => {
  const assert = require('assert');

  const allowedValuesValidator = require('../../src/validators/allowed-values');

  const field = 'test';
  const valid = function () {};


  it('should validate', () => {
    const allowedValues = [ null, false, 0, 'hello', { foo: 'bar' } ];
    const validator = allowedValuesValidator(field, { allowedValues: allowedValues }, valid);

    allowedValues.forEach(value => assert.strictEqual(validator(value), undefined, 'Failed validating value : ' + value));
  });

  it('should not validate', () => {
    const allowedValues = [ true, 'hello', 1.234, function () {}, {} ];
    const validator = allowedValuesValidator(field, { allowedValues: allowedValues }, valid);

    [
      false, 'world', 0, 1.2345, () => {}, {}
    ].forEach(value => assert.strictEqual(validator(value), 'notAllowed', 'Failed invalidating value : ' + value));
  });

  it('should throw if not an aray', () => {
    [
      null, false, true,
      NaN, Infinity, 0, 1,
      () => {}, {}, new Date(),
      '', 'test', /./
    ].forEach(allowedValues => assert.throws(() => allowedValuesValidator(field, { allowedValues: allowedValues }, valid), 'Failed to throw invalid allowedValues : ' + JSON.stringify(allowedValues)));
  });

  it('should throw if empty allowed values array', () => {
    assert.throws(() => allowedValuesValidator(field, { allowedValues: [] }, valid), 'Failed to throw invalid allowedValues')
  });

});
