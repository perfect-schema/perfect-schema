
describe('Testing any type validation', () => {

  const assert = require('assert');

  const anyType = require('../../src/types/any');
  const types = require('../../src/validators/types');

  const field = 'test';

  it('should validate "any" with no arguments', () => {
    const type = anyType(field, {});

    [
      undefined, null, false, true, NaN, Infinity, [], {},
      () => {}, new Date(), /./, "", "test", -1, 0, 1
    ].forEach(value => assert.strictEqual(type(value), undefined, 'Failed with : ' + JSON.stringify(value)));
  });

  it('should validate "any" with empty allowed types', () => {
    const type = anyType(field, { allowedTypes: [] });

    [
      undefined, null, false, true, NaN, Infinity, [], {},
      () => {}, new Date(), /./, "", "test", -1, 0, 1
    ].forEach(value => assert.strictEqual(type(value), undefined, 'Failed with : ' + JSON.stringify(value)));
  });

  it('should only accept an array for allowed types', () => {
    [
      undefined, null, true, false, NaN, -1, 0, 1,
      '', 'test', () => {}, {}, /./, new Date()
    ].forEach(types => assert.throws(() => anyType(field, { allowedTypes: types }), 'Failed with : ' + JSON.stringify(types)));
  });



  describe('Testing any one type', () => {

    it('should validate built-in', () => {
      const type = anyType(field, { allowedTypes: [String] });

      [
        '', 'test'
      ].forEach(value => assert.strictEqual(type(value), undefined, 'Failed with : ' + JSON.stringify(value)));

      [
        -1, 0, 1, false, true, NaN,
        [], {}, /./, new Date(), () => {}
      ].forEach(value => assert.strictEqual(type(value), 'invalidType', 'Failed with : ' + JSON.stringify(value)));

    });

    it('should validated asynchronously', () => {
      const TestType = { type: 'Test' };
      const testTypeValidator = function testValidator(field, specs) {
        return function (value, ctx) {
          return Promise.resolve(value === 'test' ? undefined : 'error');
        };
      };

      types.registerType(TestType, testTypeValidator, ['TestType']);

      const validator = anyType(field, { allowedTypes: ['TestType'] });

      return validator('test').then(result => {
        assert.strictEqual(result, undefined, 'Failed at validating any');

        return validator('invalid');
      }).then(result => {
        types.unregisterType(TestType);

        assert.strictEqual(result, 'error', 'Failed at validating any');
      });
    });

  });


  describe('Testing any two types', () => {

    it('should validate built-in', () => {
      const type = anyType(field, { allowedTypes: [{ type: Number, min: 0 }, String ] });

      [
        '', 'test',
        0, 1
      ].forEach(value => assert.strictEqual(type(value), undefined, 'Failed with : ' + JSON.stringify(value)));

      assert.strictEqual(type(-1), 'minNumber', 'Failed to invalidate out of range');

      [
        false, true, NaN,
        [], {}, /./, new Date(), () => {}
      ].forEach(value => assert.strictEqual(type(value), 'invalidType', 'Failed with : ' + JSON.stringify(value)));

    });

    it('should validated asynchronously', () => {
      const TestType = { type: 'Test' };
      const testTypeValidator = function testValidator(field, specs) {
        return function (value, ctx) {
          return Promise.resolve(value === 'test' ? undefined : 'error');
        };
      };

      types.registerType(TestType, testTypeValidator, ['TestType']);

      const validator = anyType(field, { allowedTypes: [{ type: Number, min: 0 }, 'TestType'] });

      return Promise.all([
        validator('test'),
        validator('invalid'),
        validator(0),
        validator(-1)
      ]).then(messages => {
        types.unregisterType(TestType);

        assert.strictEqual(messages[0], undefined, 'Failed to validate async');
        assert.strictEqual(messages[1], 'error', 'Failed to invalidate async');
        assert.strictEqual(messages[2], undefined, 'Failed to validate number async');
        assert.strictEqual(messages[3], 'minNumber', 'Failed to invalidate number async');
      });
    });

  });

});
