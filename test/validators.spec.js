

describe('Testing validators management', () => {
  const assert = require('assert');

  const validators = require('../src/validators');

  const field = 'test';


  it('should build typed validator', () => {
    const validator = validators.build(field, String);

    [
      '', 'hello'
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed to validate typed validator'));

    [
      null, true, false, NaN, -1, 0, 1,
      [], {}, /./, () => {}, new Date()
    ].forEach(value => assert.notStrictEqual(validator(value), undefined, 'Failed to invalidate typed validator'));
  });

  it('should register custom validator', () => {
    const testValidator = function (field, specs) {
      return function (value) {
        return value === 'test' ? undefined : 'error';
      };
    };

    validators.registerValidator(testValidator);

    const validator = validators.build(field, String);

    assert.strictEqual(validator('test'), undefined, 'Failed custom validator');

    [
      undefined, null, true, false, NaN, -1, 0, 1,
      [], {}, /./, () => {}, new Date(),
      'hello', '', 'world'
    ].forEach(value => assert.notStrictEqual(validator(value), undefined, 'Failed to invalidate typed validator'));

    // added simple test, unregister twice will do nothing...
    validators.unregisterValidator(testValidator);
    validators.unregisterValidator(testValidator);

    const revalidator = validators.build(field, String);

    assert.strictEqual(revalidator('hello'), undefined, 'Failed to unregister validator');
  });

  it('should throw when registering the same validator twice', () => {
    const testValidator = function () {
      return function () {};
    };

    validators.registerValidator(testValidator);

    assert.throws(() => validators.registerValidator(testValidator), 'Failed at throwing');

    validators.unregisterValidator(testValidator);
  });

  it('should only accept a function as validator', () => {
    [
      undefined, null, true, false, NaN, -1, 0, 1,
      [], {}, /./, new Date(),
      '', 'test'
    ].forEach(validator => assert.throws(() => validators.registerValidator(validator), 'Failed to throw with : ' + JSON.stringify(validator)));
  });

  it('should check that a validator returns a validation function', () => {
    [
      undefined, null, true, false, NaN, -1, 0, 1,
      [], {}, /./, new Date(),
      '', 'test'
    ].forEach(validator => assert.throws(() => validators.registerValidator(function () { return validator; }), 'Failed to throw with : ' + JSON.stringify(validator)));
  });

  return;

  it('should register in the proper order', () => {
    const testValidator1 = function (field, specs, validator) {
      return function (value, ctx) {
        //console.log("VAL 1", value, ctx);
        ctx.stack.push(1);
        return validator(value, ctx);
      };
    };
    const testValidator2 = function (field, specs, validator) {
      return function (value, ctx) {
        //console.log("VAL 2", value, ctx);
        ctx.stack.push(2);
        return validator(value, ctx);
      };
    };
    var validator, stack;

    validators.registerValidator(testValidator2, 5);
    validators.registerValidator(testValidator1, 6);

    validator = validators.build(field, String);

    assert.strictEqual(validator('', { stack: stack = [] }), undefined, 'Failed to validate');
    assert.deepStrictEqual(stack, [1, 2], 'Failed to execute validator in order');

    validators.unregisterValidator(testValidator1);
    validators.unregisterValidator(testValidator2);

    validators.registerValidator(testValidator1);   // added after custom (> 100)
    validators.registerValidator(testValidator2, 5);

    validator = validators.build(field, String);

    assert.strictEqual(validator('', { stack: stack = [] }), undefined, 'Failed to validate');
    assert.deepStrictEqual(stack, [2, 1], 'Failed to execute validator in order');

    validators.unregisterValidator(testValidator1);
    validators.unregisterValidator(testValidator2);
  });

});
