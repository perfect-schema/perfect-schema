
describe('Integer validation', () => {
  const assert = require('assert');

  const integerValidator = require('../../src/validators/integer');


  it('should validate if undefined', function () {
    const validator = integerValidator({});

    assert.strictEqual(validator(undefined), undefined, 'Failed at validating undefined');
  });

  it('should validate valid type', () => {
    const validator = integerValidator({});

    [
      -98765, -1, 0, 1, 123456
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating valid type : ' + JSON.stringify(value)));
  });

  it('should validate invalid type', () => {
    const validator = integerValidator({});

    [
      true, false, null,
      "", "abc",
      -1.2, 0.01, 123.456, Infinity, NaN,
      new Date(), [], {}, () => {}, /./
    ].forEach(value => assert.strictEqual(validator(value), 'invalidType', 'Failed at validating invalid type : ' + JSON.stringify(value)));
  });

  it('should validate min value', () => {
    const validator = integerValidator({ min: 10 });

    [
      123456, 100, 10
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating min value : ' + JSON.stringify(value)));

    [
      9, 8, 0, -10, -1000
    ].forEach(value => assert.strictEqual(validator(value), 'minInteger', 'Failed at validating min value : ' + JSON.stringify(value)));
  });

  it('should validate max value', () => {
    const validator = integerValidator({ max: 8 });

    [
      -1000, 0, 2, 8
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating max value : ' + JSON.stringify(value)));

    [
      9, 100, 10000
    ].forEach(value => assert.strictEqual(validator(value), 'maxInteger', 'Failed at validating max value : ' + JSON.stringify(value)));
  });

  it('should define custom type', () => {
    assert.strictEqual("" + integerValidator.Type, 'integer', 'Unexpected toString value');
  });

});
