
describe('Boolean validation', () => {
  const assert = require('assert');

  const booleanValidator = require('../../src/validators/boolean');

  it('should validate if undefined', () => {
    const validator = booleanValidator({});

    assert.strictEqual(validator(undefined), undefined, 'Failed at validating undefined');
  });

  it('should validate valid type', () => {
    const validator = booleanValidator({});

    [
      true, false
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating valid type : ' + JSON.stringify(value)));
  });

  it('should validate invalid type', () => {
    const validator = booleanValidator({});

    [
      null, "", "123",
      -1, 0, 1, Infinity, NaN,
      new Date(), [], {}, () => {}, /./
    ].forEach(value => assert.strictEqual(validator(value), 'invalidType', 'Failed at validating invalid type : ' + JSON.stringify(value)));
  });

});
