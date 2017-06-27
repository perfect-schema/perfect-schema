

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


});
