
describe('Testing custom validator', () => {
  const assert = require('assert');

  const customValidator = require('../../src/validators/custom');

  const field = 'test';
  const valid = function () {};


  it('should be a function', () => {
    [
      true, -1, 1, 'test',
      [], {}, /./, new Date()
    ].forEach(custom => assert.throws(() => customValidator(field, { custom: custom }), 'Failed to throw on : ' + JSON.stringify(custom)));
  });

  it('should validate custom validation', () => {
    const custom = function (value) {
      return value === 'test' ? undefined : 'error';
    };
    const validator = customValidator(field, { custom: custom }, valid);

    assert.strictEqual(validator('test'), undefined, 'Failed at validating');
    assert.strictEqual(validator('hello'), 'error', 'Failed at invalidating');
  });

  it('should validate custom validation asynchrnously', () => {
    const custom = function (value) {
      return Promise.resolve(value === 'test' ? undefined : 'error');
    };
    const validator = customValidator(field, { custom: custom }, valid);

    return Promise.all([
      validator('test'),
      validator('hello')
    ]).then(messages => {
      assert.strictEqual(messages[0], undefined, 'Failed at validating');
      assert.strictEqual(messages[1], 'error', 'Failed at invalidating');
    });
  });

});
