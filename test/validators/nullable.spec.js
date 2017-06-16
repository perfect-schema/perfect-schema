
describe('Testing required validator', () => {
  const assert = require('assert');

  const nullableValidator = require('../../src/validators/nullable');

  const field = 'test';
  const valid = function () {};

  it('should validate if null (nullable)', () => {
    const validator = nullableValidator(field, { nullable: true }, valid);

    assert.strictEqual(validator(null), undefined, 'Failed at validating undefined');
  });

  it('should fail to validate if null (not nullable)', () => {
    const validator = nullableValidator(field, {}, valid);

    assert.strictEqual(validator(null), 'noValue', 'Failed at validating undefined');
  });

  it('should validate not nullable', () => {
    const validator = nullableValidator(field, {}, valid);

    [
      false, true, NaN,
      -1, 0, 1, 0.1234, 't', 'hello',
      () => {}, function PerfectSchema() {},
      {}, [], /./, new Date()
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed to validate : ' + JSON.stringify(value)));
  });

  it('should validate nullable', () => {
    const validator = nullableValidator(field, { nullable: true }, valid);

    [
      false, true, NaN,
      -1, 0, 1, 0.1234, 't', 'hello',
      () => {}, function PerfectSchema() {},
      {}, [], /./, new Date()
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed to validate : ' + JSON.stringify(value)));
  });

});
