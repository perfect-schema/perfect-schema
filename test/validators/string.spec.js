
describe('String validation', () => {
  const assert = require('assert');

  const stringValidator = require('../../src/validators/string');

  it('should validate valid type', () => {
    const validator = stringValidator({});

    [
      "", "foo"
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating valid type : ' + value));
  });

  it('should validate invalid type', () => {
    const validator = stringValidator({});

    [
      undefined, null,
      -1, 0, 1, Infinity, NaN,
      [], {}, function () {}, /./
    ].forEach(value => assert.strictEqual(validator(value), 'invalidType', 'Failed at validating invalid type : ' + value));
  })

  it('should validate min length', () => {
    const validator = stringValidator({ min: 3 });

    [
      "123", "abc", "   "
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating min length : ' + value));

    [
      "", "12"
    ].forEach(value => assert.strictEqual(validator(value), 'minString', 'Failed at validating min length : ' + value));
  });

  it('should validate max length', () => {
    const validator = stringValidator({ max: 5 });

    [
      "1", "12", "123", "1234", "12345", "abcde", "     "
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating min length : ' + value));

    [
      "123456", "1234567", "      "
    ].forEach(value => assert.strictEqual(validator(value), 'maxString', 'Failed at validating max length : ' + value));
  });

});
