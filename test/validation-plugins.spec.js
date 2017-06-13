

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

    const userPlugin = function () {
      return function (value) {

      };
    };

    afterEach() {
      plugins.unregisterPlugin(userPlugin);
    }


    it('should register new user plugin', () => {
      assert.doesNotThrow(() => plugins.registerPlugin(userPlugin), 'Failed to register plugin');
    });

    it('should unregister user plugin', () => {
      assert.doesNotThrow(() => plugins.unregisterPlugin(userPlugin), 'Failed to unregister plugin');
    });

    //it('should apply user plugin', () => {

    //});

  });


});
