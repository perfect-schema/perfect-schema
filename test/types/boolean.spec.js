
describe('Boolean validation', () => {
  const assert = require('assert');

  const booleanValidator = require('../../src/types/boolean');

  const field = 'test';

  it('should validate if undefined', () => {
    const validator = booleanValidator(field, {});

    assert.strictEqual(validator(undefined), undefined, 'Failed at validating undefined');
  });

  it('should validate valid type', () => {
    const validator = booleanValidator(field, {});

    [
      true, false
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating valid type : ' + JSON.stringify(value)));
  });

  it('should validate invalid type', () => {
    const validator = booleanValidator(field, {});

    [
      null, "", "123",
      -1, 0, 1, Infinity, NaN,
      new Date(), [], {}, () => {}, /./
    ].forEach(value => assert.strictEqual(validator(value), 'invalidType', 'Failed at validating invalid type : ' + JSON.stringify(value)));
  });

});
