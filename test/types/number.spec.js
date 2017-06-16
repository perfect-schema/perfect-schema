
describe('Testing Number type validation', () => {
  const assert = require('assert');

  const numberValidator = require('../../src/types/number');

  const field = 'test';

  it('should validate if undefined', function () {
    const validator = numberValidator(field, {});

    assert.strictEqual(validator(undefined), undefined, 'Failed at validating undefined');
  });

  it('should validate valid type', () => {
    const validator = numberValidator(field, {});

    [
      -98765, -654.321, -1, 0, 1, 678.901, 123456
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating valid type : ' + JSON.stringify(value)));
  });

  it('should validate invalid type', () => {
    const validator = numberValidator(field, {});

    [
      true, false, null,
      "", "abc",
      -Infinity, Infinity, NaN,
      new Date(), [], {}, () => {}, /./
    ].forEach(value => assert.strictEqual(validator(value), 'invalidType', 'Failed at validating invalid type : ' + JSON.stringify(value)));
  });

  it('should validate min value', () => {
    const validator = numberValidator(field, { min: 10 });

    [
      123456, 321.456, 100, 10.00000001, 10
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating min value : ' + JSON.stringify(value)));

    [
      9.99999999, 9, 8, 0, -10.456, -1000
    ].forEach(value => assert.strictEqual(validator(value), 'minNumber', 'Failed at validating min value : ' + JSON.stringify(value)));
  });

  it('should validate max value', () => {
    const validator = numberValidator(field, { max: 8 });

    [
      -1000, -567.89, 0, 2, 7.99999999999, 8
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating max value : ' + JSON.stringify(value)));

    [
      8.0000000001, 9, 100, 789.123, 10000
    ].forEach(value => assert.strictEqual(validator(value), 'maxNumber', 'Failed at validating max value : ' + JSON.stringify(value)));
  });

});
