
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
      ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed validating string : ' + JSON.stringify(value)));
    });

    it('should validate typed arrays', () => {
      const validator = typeValidator(field, { type: ['string'] }, valid);

      [
        [], ['hello'], ['hello', 'world']
      ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed validating string : ' + JSON.stringify(value)));
    });

    it('should validate typed arrays (long)', () => {
      const validator = typeValidator(field, { type: Array, elementType: String }, valid);

      [
        [], ['hello'], ['hello', 'world']
      ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed validating string : ' + JSON.stringify(value)));
    });

  });



  describe('Testing custom types', () => {

    const UserType = { type: 'Test' };
    const validator = function userValidator(field, specs) {
      return function validate(value, ctx) {
        return value === 'test' ? undefined : 'error';
      }
    };
    const userAlias = 'testType';

    beforeEach(() => {
      typeValidator.registerType(UserType, validator, [userAlias]);
    });

    afterEach(() => {
      typeValidator.unregisterType(UserType);
    });

    it('should validate', () => {
      const validator = typeValidator(field, { type: userAlias }, valid);

      assert.strictEqual(validator('test'), undefined, 'Failed validating');
      assert.strictEqual(validator('hello'), 'error', 'Failed validating error');
    });

    it('should unregister', () => {
      typeValidator.unregisterType(UserType);

      assert.throws(() => typeValidator(field, { type: userAlias }, valid), 'Failed at unregistering');
    });

    it('should not register invalid type', () => {
      [
        undefined, null, true, false, NaN, 0, '', 'test'
      ].forEach(type => assert.throws(() => typeValidator.registerType(type), 'Failed to throw with : ' + JSON.stringify(type)));
    });

    it('should not register if validator is not a function', () => {
      const type = { test: true };

      [
        undefined, null, true, false, NaN, 0, '', 'test',
        {}, [], /./, new Date()
      ].forEach(validator => assert.throws(() => typeValidator.registerType(type, validator), 'Failed to throw with : ' + JSON.stringify(validator)));
    });

    it('should not register if validator function does not return a type validator', () => {
      const type = { test: true };

      [
        undefined, null, true, false, NaN, 0, '', 'test',
        {}, [], /./, new Date()
      ].forEach(validator => assert.throws(() => typeValidator.registerType(type, function () { return validator; }), 'Failed to throw with : ' + JSON.stringify(validator)));
    });

    it('should register without an alias', () => {
      const type = { test: true };
      const validatorWrapper = function () { return function () {}; };

      typeValidator.registerType(type, validatorWrapper);

      const validator = typeValidator(field, { type: type }, valid);

      assert.strictEqual(validator(), undefined, 'Failed validating');

      typeValidator.unregisterType(type);
    });

    it('should register without an alias', () => {
      const type = { test: true };
      const validatorWrapper = function () { return function () {}; };

      typeValidator.registerType(type, validatorWrapper);

      const validator = typeValidator(field, { type: type }, valid);

      assert.strictEqual(validator(), undefined, 'Failed validating');

      typeValidator.unregisterType(type);
    });

    it('should register without an alias', () => {
      const type = { test: true };
      const validatorWrapper = function () { return function () {}; };

      typeValidator.registerType(type, validatorWrapper, []);

      const validator = typeValidator(field, { type: type }, valid);

      assert.strictEqual(validator(), undefined, 'Failed validating');

      typeValidator.unregisterType(type);
    });

    it('should not register for invalid aliases', () => {
      const type = { test: true };
      const validator = function () { return function () {}; };

      [
        null, true, false, NaN, 0, '', 'test', userAlias,
        [undefined], [null], [false], [NaN], [0], [''], [userAlias],
        {}, /./, new Date()
      ].forEach(aliases => assert.throws(() => typeValidator.registerType(type, validator, aliases), 'Failed to throw with : ' + JSON.stringify(aliases)));
    });

    it('should not validate removed types', () => {
      const type = { test: true };
      const validatorWrapper = function () { return function () {}; };

      typeValidator.registerType(type, validatorWrapper);
      typeValidator.unregisterType(type);

      assert.throws(() => typeValidator(field, { type: type }, valid), 'Failed to throw in removed type');
    });

  });



  describe('Testing asynchronous type validation', () => {

    const UserType = { type: 'Test' };
    const validator = function userValidator(field, specs) {
      return function validate(value, ctx) {
        return Promise.resolve(value === 'test' ? undefined : 'error');
      }
    };

    beforeEach(() => {
      typeValidator.registerType(UserType, validator, ['testType']);
    });

    afterEach(() => {
      typeValidator.unregisterType(UserType);
    });

    it('should validate asynchronously', () => {
      const validator = typeValidator(field, { type: 'testType' }, valid);

      return validator('test').then(message => assert.strictEqual(message, undefined, 'Failed validating'));
    });

    it('should fail to validate asynchronously', () => {
      const validator = typeValidator(field, { type: 'testType' }, valid);

      return validator('hello').then(message => assert.strictEqual(message, 'error', 'Failed validating'));
    });

  });

});
