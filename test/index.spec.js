

describe('Testing module entry point', () => {
  const assert = require('assert');

  const PerfectSchema = require('../src/');

  it('should expose public API', () => {
    const AnyType = require('../src/types/any').Type;
    const IntegerType = require('../src/types/integer').Type;
    const Schema = require('../src/schema');
    const Model = require('../src/model');
    const validators = require('../src/validators');
    const types = require('../src/validators/types');

    assert.strictEqual(PerfectSchema, Schema, 'Failed at exporting Schema');

    // Types
    assert.strictEqual(PerfectSchema.Any, AnyType, 'Failed at exporting Any type');
    assert.strictEqual(PerfectSchema.Integer, IntegerType, 'Failed at exporting Integer type');
    // API
    assert.strictEqual(PerfectSchema.isModel, Model.isModel, 'Failed at exporting isModel');

    assert.strictEqual(PerfectSchema.registerValidator, validators.registerValidator, 'Failed at exporter validator registry (add)');
    assert.strictEqual(PerfectSchema.unregisterValidator, validators.unregisterValidator, 'Failed at exporter validator registry (remove)');
    assert.strictEqual(PerfectSchema.registerType, types.registerType, 'Failed at exporter type registry (add)');
    assert.strictEqual(PerfectSchema.unregisterType, types.unregisterType, 'Failed at exporter type registry (remove)');
  });


  it('should create new instances', () => {
    const schema = new PerfectSchema({
      foo: String,
      bar: {
        type: PerfectSchema.Integer,
        defaultValue: 17
      }
    });

    const model = schema.createModel();

    return model.set('foo', 'test').then(() => {

      assert.strictEqual(model.get('foo'), 'test', 'Failed setting string');
      assert.strictEqual(model.get('bar'), 17, 'Failed setting defualt value');
    });
  });


  it('should call custom validator with context', () => {
    const schema = new PerfectSchema({
      foo: String,
      bar: {
        type: String,
        custom(value, ctx) {
          const field = ctx.field('foo');

          assert.ok(field.exists, 'Failed to have all model data within context');
          assert.strictEqual(field.value, 'hello', 'Field does not have same value in context');
        }
      }
    });

    const model = schema.createModel();

    model._data.foo = 'hello';  // manually setting fields...

    return model.set({ bar: 'world' });
  });


});
