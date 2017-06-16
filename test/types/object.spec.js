
describe('Object validation', () => {
  const assert = require('assert');

  const objectValidator = require('../../src/types/object');

  const field = 'test';

  it('should validate if undefined', () => {
    const validator = objectValidator(field, {});

    assert.strictEqual(validator(undefined), undefined, 'Failed at validating undefined');
  });

  it('should validate valid type', () => {
    const validator = objectValidator(field, {});

    [
      {}
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating valid type : ' + JSON.stringify(value)));
  });

  it('should validate invalid type', () => {
    const validator = objectValidator(field, {});

    [
      true, false, null, "", "abc",
      -1, 0, 1, Infinity, NaN,
      new Date(), [], () => {}, /./
    ].forEach(value => assert.strictEqual(validator(value), 'invalidType', 'Failed at validating invalid type : ' + JSON.stringify(value)));
  });

});
