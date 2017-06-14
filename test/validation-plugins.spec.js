

describe('Testing validation plugins', () => {
  const assert = require('assert');

  const plugins = require('../src/validation-plugins');

  const identity = function (value) { return value; };


  describe('Testing built-in validator', () => {

    it('should return required field validator', () => {
      const specs = { required: true };
      const validator = identity;
      const actualValidator = plugins.applyPlugins(specs, validator);

      assert.strictEqual(actualValidator(undefined), 'required', 'Failed to return "reuired" message');
      assert.strictEqual(actualValidator(null), 'noValue', 'Failed to return "noValue" message');

      [
        false, true, -1, 0, 1, Infinity,
        () => {}, [], {}, /./, new Date()
      ].forEach(value => assert.strictEqual(actualValidator(value), value, 'Failed to validate : ' + JSON.stringify(value)));
    });

    it('should return nullable field validator', () => {
      const specs = { nullable: true };
      const validator = identity;
      const actualValidator = plugins.applyPlugins(specs, validator);

      assert.strictEqual(actualValidator(null), undefined, 'Failed to ignore null');

      [
        undefined, false, true, -1, 0, 1, Infinity,
        () => {}, [], {}, /./, new Date()
      ].forEach(value => assert.strictEqual(actualValidator(value), value, 'Failed to validate : ' + JSON.stringify(value)));
    });

    it('should return custom field validator', () => {
      const specs = { custom(value) { return value === 'hello' ? undefined : 'test'; } };
      const validator = identity;
      const actualValidator = plugins.applyPlugins(specs, validator);

      assert.strictEqual(actualValidator('hello'), 'hello', 'Failed to validate');

      [
        undefined, false, true, -1, 0, 1, Infinity,
        () => {}, [], {}, /./, new Date()
      ].forEach(value => assert.strictEqual(actualValidator(value), 'test', 'Failed to validate : ' + JSON.stringify(value)));
    });

    it('should fail if custom validator is not a function', () => {
      const validator = identity;

      [
        true, -1, 1, Infinity,
        [], {}, /./, new Date()
      ].forEach(custom => assert.throws(() => plugins.applyPlugins({ custom: custom }, validator), 'Failed to throw on invalid custom : ' + JSON.stringify(custom)));
    });

  });


  describe('Testing user plugins', () => {

    const userPlugin = function (specs, validator) {
      return function (value) {
        return value === 'test' ? 'errorTest' : validator(value);
      };
    };

    beforeEach(() => {
      plugins.registerPlugin(userPlugin);
    });

    afterEach(() => {
      plugins.unregisterPlugin(userPlugin);
    });

    it('should apply user plugin', () => {
      const specs = {};
      const validator = identity;
      const actualValidator = plugins.applyPlugins(specs, validator);

      assert.strictEqual(actualValidator('test'), 'errorTest', 'Failed user plugin');

      [
        -1, 0, 1, "", () => {},
        [], {}, /./, new Date()
      ].forEach(value => assert.strictEqual(actualValidator(value), value, 'Failed plugin validation : ' + JSON.stringify(value)));
    });

    it('should not allow plugin who is not a function', () => {
      [
        undefined, null, -1, 0, 1, NaN, Infinity, "", "test",
        [], {}, /./, new Date()
      ].forEach(plugin => assert.throws(() => plugins.registerPlugin(plugin), 'Failed with invalid plugin : ' + JSON.stringify(plugin)));
    });

    it('should not allow plugin who do not return a validator function', () => {
      [
        undefined, null, -1, 0, 1, NaN, Infinity, "", "test",
        [], {}, /./, new Date()
      ].forEach(plugin => assert.throws(() => plugins.registerPlugin(function () { return plugin; }), 'Failed with invalid plugin : ' + JSON.stringify(plugin)));
    });

    it('should register and unregister only once', () => {
      const r1 = plugins.registerPlugin(userPlugin);
      const r2 = plugins.registerPlugin(userPlugin);
      const r3 = plugins.registerPlugin(userPlugin);

      assert.strictEqual(r1, r2, 'Duplicate registering');
      assert.strictEqual(r2, r3, 'Duplicate registering');

      const u1 = plugins.unregisterPlugin(userPlugin);
      const u2 = plugins.unregisterPlugin(userPlugin);
      const u3 = plugins.unregisterPlugin(userPlugin);

      assert.strictEqual(u1, u2, 'Failed unregistering');
      assert.strictEqual(u2, u3, 'Failed unregistering');
    });

  });


});
