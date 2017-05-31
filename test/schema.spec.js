

describe('Testing Schema', () => {
  const assert = require('assert');

  const Schema = require('../src/schema');

  it('should not create without fields', () => {
    assert.throws(() => { new Schema(); }, TypeError);

    [
      undefined, null, true, false, NaN, {}
    ].forEach(fields => assert.throws(() => { new Schema(fields); }, TypeError));
  });


  it('should construct new instance', () => {
    const fields = {
      foo: String
    };
    const schema = new Schema(fields);

    assert.deepStrictEqual(schema._fields, fields, 'Fields mismatch');
    assert.deepStrictEqual(Object.keys(fields), Object.keys(schema._validators), 'Field validator mismatch');
  });


  it('should construct new instance with sub-schema', () => {
    const barFields = {
      bar: String
    };
    const barSchema = new Schema(barFields);
    const fooFields = {
      foo: barSchema
    };
    const fooSchema = new Schema(fooFields);

    assert.strictEqual(fooSchema._fields['foo'].type, barSchema, 'Failed to normalize sub-schema short type');
  });


  it('should extend schema', () => {
    const baseFields = {
      foo: String
    };
    const extendedFields = {
      foo: {
        required: true,
        min: 3
      },
      bar: Object
    };

    const schema = new Schema(baseFields);

    assert.strictEqual(schema._fieldNames.length, 1, 'Mismatch field names');

    schema.extends(extendedFields);

    assert.strictEqual(schema._fieldNames.length, 2, 'Mismatch field names');
  });


  it('should create model', () => {
    const fields = {
      foo: String
    };
    const schema = new Schema(fields);

    const modelA = schema.createModel();
    const modelB = schema.createModel();

    assert.ok(modelA && modelB, 'Models are not objects');
    assert.ok(modelA._id && modelB._id, 'Models have no identifiers');
    assert.notStrictEqual(modelA._id, modelB._id, 'Models have no unique identifiers');
  });


  describe('Testing validation', () => {

    it('should validate simple data', () => {
      const fields = {
        foo: String
      };
      const schema = new Schema(fields);

      const validator = schema.validate({ foo: 'hello' });

      validator.then(messages => {
        assert.deepStrictEqual(messages, [], 'Failed to validate model');
      });
    });

    it('should invalidate simple data', () => {
      const fields = {
        foo: String
      };
      const schema = new Schema(fields);

      const validator = schema.validate({ foo: 123 });

      return validator.then(messages => {
        assert.deepStrictEqual(messages, [ { fieldName: 'foo', message: 'invalidType', value: 123 } ], 'Failed to find error in validation');
      });
    });

    it('should validate nested data', () => {
      const barFields = {
        bar: String
      };
      const barSchema = new Schema(barFields);
      const fooFields = {
        foo: barSchema
      };
      const fooSchema = new Schema(fooFields);

      const validator = fooSchema.validate({ foo: { bar: 'hello' } });

      return validator.then(messages => {
        assert.deepStrictEqual(messages, [], 'Failed to validate model');
      });
    });

    it('should invalidate nested data', () => {
      const barFields = {
        bar: String
      };
      const barSchema = new Schema(barFields);
      const fooFields = {
        foo: barSchema,
        bob: String
      };
      const fooSchema = new Schema(fooFields);

      return fooSchema.validate({ foo: { bar: 123 }, bob: 456 }).then(messages => {
        assert.deepStrictEqual(messages, [
          { fieldName: 'bob', message: 'invalidType', value: 456 },
          { fieldName: 'foo.bar', message: 'invalidType', value: 123 }
        ], 'Failed to find error in validation');
      });
    });

  });

});
