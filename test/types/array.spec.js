
describe('Boolean validation', () => {
  const assert = require('assert');

  const arrayValidator = require('../../src/types/array');

  const field = 'test';

  it('should validate if undefined', () => {
    const validator = arrayValidator(field, {});

    assert.strictEqual(validator(undefined), undefined, 'Failed at validating undefined');
  });

  it('should validate valid type', () => {
    const validator = arrayValidator(field, {});

    [
      [], new Array(), [null, null], [0, 1, 2], ["abc"]
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating valid type : ' + JSON.stringify(value)));
  });

  it('should validate invalid type', () => {
    const validator = arrayValidator(field, {});

    [
      false, true, null, "", "123",
      -1, 0, 1, Infinity, NaN,
      new Date(), {}, () => {}, /./
    ].forEach(value => assert.strictEqual(validator(value), 'invalidType', 'Failed at validating invalid type : ' + JSON.stringify(value)));
  });

  it('should validate min length', () => {
    const validator = arrayValidator(field, { min: 3 });

    [
      [null, null, null], [null, null, null, null], [null, null, null, null, null]
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating min length : ' + JSON.stringify(value)));

    [
      [null, null], [null], []
    ].forEach(value => assert.strictEqual(validator(value), 'minArray', 'Failed at validating min length : ' + JSON.stringify(value)));
  });

  it('should validate max length', () => {
    const validator = arrayValidator(field, { max: 3 });

    [
      [null, null, null], [null, null], [null], []
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating max length : ' + JSON.stringify(value)));

    [
      [null, null, null, null], [null, null, null, null, null]
    ].forEach(value => assert.strictEqual(validator(value), 'maxArray', 'Failed at validating max length : ' + JSON.stringify(value)));
  });

});
