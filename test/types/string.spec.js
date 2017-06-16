
describe('Testing String type validation', () => {
  const assert = require('assert');

  const stringValidator = require('../../src/types/string');

  const field = 'test';

  it('should validate if undefined', () => {
    const validator = stringValidator(field, {});

    assert.strictEqual(validator(undefined), undefined, 'Failed at validating undefined');
  });

  it('should validate valid type', () => {
    const validator = stringValidator(field, {});

    [
      "", "foo"
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating valid type : ' + JSON.stringify(value)));
  });

  it('should validate invalid type', () => {
    const validator = stringValidator(field, {});

    [
      true, false, null,
      -1, 0, 1, Infinity, NaN,
      new Date(), [], {}, () => {}, /./
    ].forEach(value => assert.strictEqual(validator(value), 'invalidType', 'Failed at validating invalid type : ' + JSON.stringify(value)));
  });

  it('should validate min length', () => {
    const validator = stringValidator(field, { min: 3 });

    [
      "123", "abc", "   "
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating min length : ' + JSON.stringify(value)));

    [
      "", "12"
    ].forEach(value => assert.strictEqual(validator(value), 'minString', 'Failed at validating min length : ' + JSON.stringify(value)));
  });

  it('should validate max length', () => {
    const validator = stringValidator(field, { max: 5 });

    [
      "1", "12", "123", "1234", "12345", "abcde", "     "
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating min length : ' + JSON.stringify(value)));

    [
      "123456", "1234567", "      "
    ].forEach(value => assert.strictEqual(validator(value), 'maxString', 'Failed at validating max length : ' + JSON.stringify(value)));
  });

});
