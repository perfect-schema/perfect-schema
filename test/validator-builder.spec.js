

describe('Testing validator builder', () => {
  const assert = require('assert');

  const validatorBuilder = require('../src/validator-builder');
  const validators = require('../src/validators');

  it('should build with no fields', () => {

    assert.deepEqual(validatorBuilder(), {}, 'Failed with no arguments');

    [
      undefined, null, false, '', {}, [], 0
    ].forEach(fields => assert.deepEqual(validatorBuilder(fields), {}, 'Failed with no argument : ' + JSON.stringify(fields)));
  });

  it('should build with primitives', () => {
    [
      [String, 'abc'], ['string', 'abc'],
      [Boolean, true], ['boolean', true],
      [Object, {}], ['object', {}]
    ].forEach(options => {
      const fields = { foo: options[0] };
      const fieldValidators = validatorBuilder(fields);

      assert.deepEqual(Object.keys(fields), Object.keys(fieldValidators), 'Field mismatch in validators');
      assert.strictEqual(fieldValidators.foo(options[1]), undefined, 'Failed validation');
    });
  });

  it('should build with any fields');

  it('should build with arrays');

  it('should build with schema instances');


});
