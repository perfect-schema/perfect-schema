
describe('Testing types validator', () => {
  const assert = require('assert');

  const typeValidator = require('../../src/validators/types');

  const field = 'test';
  const valid = function () {};


  it('should fail if no type is specified', () => {
    [
      undefined, null,
      {},
      {type: undefined }, { type: null }
    ].forEach(specs => assert.throws(() => typeValidator(field, specs), 'Failed to throw with : ' + JSON.stringify(specs)));
  });

  it('should fail if alias does not exist', () => {
    assert.throws(() => typeValidator(field, 'foo'), 'Failed to throw invalid alias');
    assert.throws(() => typeValidator(field, { type: 'foo' }), 'Failed to throw invalid alias');
  });

  it('should fail if type does not exist', () => {
    const FooType = {};

    assert.throws(() => typeValidator(field, FooType), 'Failed to throw invalid alias');
    assert.throws(() => typeValidator(field, { type: FooType }), 'Failed to throw invalid alias');
  });


  it('should validate shorthand type', () => {
    const validator = typeValidator(field, String, valid);

    [
      '', 'test'
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed validating string : ' + value));
  });

  it('should validate shorthand alias', () => {
    const validator = typeValidator(field, 'string', valid);

    [
      '', 'test'
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed validating string : ' + value));
  });

  it('should validate standard type', () => {
    const validator = typeValidator(field, { type: String }, valid);

    [
      '', 'test'
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed validating string : ' + value));
  });

  it('should validate standard alias', () => {
    const validator = typeValidator(field, { type: 'string' }, valid);

    [
      '', 'test'
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed validating string : ' + value));
  });



  describe('Testing typed arrays', () => {

    it('should validate typed arrays (shortcut)', () => {
      const validator = typeValidator(field, ['string'], valid);

      [
        [], ['hello'], ['hello', 'world']
      ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed validating string : ' + value));
    });

  });



  describe('Testing custom types', () => {

    const UserType = function UserType () {};
    const validator = function userValidator(field, specs) {
      return function validate(value, ctx) {
        return value === 'test' ? undefined : 'error';
      }
    };

    beforeEach(() => {
      typeValidator.registerType(UserType, validator, ['testType']);
    });

    afterEach(() => {
      typeValidator.unregisterType(UserType);
    });

    it('should validate', () => {
      const validator = typeValidator(field, { type: 'testType' }, valid);

      assert.strictEqual(validator('test'), undefined, 'Failed validating');
      assert.strictEqual(validator('hello'), 'error', 'Failed validating error');
    });

  });

});
