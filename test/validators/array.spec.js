
describe('Boolean validation', () => {
  const assert = require('assert');

  const arrayValidator = require('../../src/validators/array');

  it('should validate if undefined', () => {
    const validator = arrayValidator({});

    assert.strictEqual(validator(undefined), undefined, 'Failed at validating undefined');
  });

  it('should validate valid type', () => {
    const validator = arrayValidator({});

    [
      [], new Array(), [null, null], [0, 1, 2], ["abc"]
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating valid type : ' + JSON.stringify(value)));
  });

  it('should validate invalid type', () => {
    const validator = arrayValidator({});

    [
      false, true, null, "", "123",
      -1, 0, 1, Infinity, NaN,
      new Date(), {}, () => {}, /./
    ].forEach(value => assert.strictEqual(validator(value), 'invalidType', 'Failed at validating invalid type : ' + JSON.stringify(value)));
  });

  it('should validate min length', () => {
    const validator = arrayValidator({ min: 3 });

    [
      [null, null, null], [null, null, null, null], [null, null, null, null, null]
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating min length : ' + JSON.stringify(value)));

    [
      [null, null], [null], []
    ].forEach(value => assert.strictEqual(validator(value), 'minArray', 'Failed at validating min length : ' + JSON.stringify(value)));
  });

  it('should validate max length', () => {
    const validator = arrayValidator({ max: 3 });

    [
      [null, null, null], [null, null], [null], []
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating max length : ' + JSON.stringify(value)));

    [
      [null, null, null, null], [null, null, null, null, null]
    ].forEach(value => assert.strictEqual(validator(value), 'maxArray', 'Failed at validating max length : ' + JSON.stringify(value)));
  });

});
