
describe('Testing required validator', () => {
  const assert = require('assert');

  const requiredValidator = require('../../src/validators/required');

  const field = 'test';
  const valid = function () {};

  it('should validate if undefined (not required)', () => {
    const validator = requiredValidator(field, {}, valid);

    assert.strictEqual(validator(undefined), undefined, 'Failed at validating undefined');
  });

  it('should fail to validate if undefined (required)', () => {
    const validator = requiredValidator(field, { required: true }, valid);

    assert.strictEqual(validator(undefined), 'required', 'Failed at validating undefined');
  });

  it('should validate not required', () => {
    const validator = requiredValidator(field, {}, valid);

    [
      false, true, NaN,
      -1, 0, 1, 0.1234, 't', 'hello',
      () => {}, function PerfectSchema() {},
      {}, [], /./, new Date()
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed to validate : ' + JSON.stringify(value)));
  });

  it('should validate required', () => {
    const validator = requiredValidator(field, { required: true }, valid);

    [
      false, true, NaN,
      -1, 0, 1, 0.1234, 't', 'hello',
      () => {}, function PerfectSchema() {},
      {}, [], /./, new Date()
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed to validate : ' + JSON.stringify(value)));
  });

});
