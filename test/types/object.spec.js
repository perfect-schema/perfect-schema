
describe('Object validation', () => {
  const assert = require('assert');

  const objectValidator = require('../../src/validators/object');

  it('should validate if undefined', () => {
    const validator = objectValidator({});

    assert.strictEqual(validator(undefined), undefined, 'Failed at validating undefined');
  });

  it('should validate valid type', () => {
    const validator = objectValidator({});

    [
      {}
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating valid type : ' + JSON.stringify(value)));
  });

  it('should validate invalid type', () => {
    const validator = objectValidator({});

    [
      true, false, null, "", "abc",
      -1, 0, 1, Infinity, NaN,
      new Date(), [], () => {}, /./
    ].forEach(value => assert.strictEqual(validator(value), 'invalidType', 'Failed at validating invalid type : ' + JSON.stringify(value)));
  });

});
