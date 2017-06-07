

describe('Testing Schema', () => {
  const assert = require('assert');

  const Schema = require('../src/schema');


  it('should validate isSchema', () => {
    const fields = {
      foo: String
    };
    const schema = new Schema(fields);

    assert.ok(Schema.isSchema(schema, 'Failed to validate isSchema'));
  });


  it('should not validate isSchema', () => {
    [
      undefined, null, false, true, NaN,
      -1, 0, 1, 0.1234, 't', 'hello',
      () => {}, function PerfectSchema() {},
      {}, [], /./, new Date()
    ].forEach(invalidSchema => assert.ok(!Schema.isSchema(invalidSchema), 'Failed to invalidate isSchema for : ' + JSON.stringify(invalidSchema)));
  });


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

    it('should validate nothing', () => {
      const fields = {
        foo: String
      };
      const schema = new Schema(fields);

      const validator = schema.validate();

      return validator.then(messages => {
        assert.deepStrictEqual(messages, [], 'Failed to validate nothing');
      });
    });

    it('should validate simple data', () => {
      const fields = {
        foo: String
      };
      const schema = new Schema(fields);

      const validator = schema.validate({ foo: 'hello' });

      assert.ok(validator.isPending(), 'Failed at pending validator');
      assert.deepStrictEqual(validator.getMessages(), [], 'Array should be initially empty');

      return validator.then(messages => {
        assert.ok(validator.isPending(), 'Failed at pending validator');

        assert.deepStrictEqual(messages, [], 'Failed to validate model');
        assert.deepStrictEqual(validator.getMessages(), messages, 'Failed at returning messages from validator');
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
        assert.deepStrictEqual(validator.getMessages(), messages, 'Failed at returning messages from validator');
      });
    });

    /*
    it('should only allow empty sub-schema if optional', () => {
      const barFields = {
        bar: String
      };
      const barSchema = new Schema(barFields);
      const fooFieldsA = {
        foo: barSchema
      };
      const fooSchemaA = new Schema(fooFieldsA);
      const fooFieldsB = {
        foo: {
          type: barSchema,
          optional: true
        }
      };
      const fooSchemaB = new Schema(fooFieldsB);

      const validatorA = fooSchemaA.validate({ foo: null });
      const validatorB = fooSchemaB.validate({ foo: null });

      return Promise.all([ validatorA, validatorB ]).then(allMessages => {
        const messagesA = allMessages[0];
        const messagesB = allMessages[1];

        assert.deepStrictEqual(messagesA, [], 'Failed to validate required field');
        assert.deepStrictEqual(messagesB, [], 'Failed to validate optional field');
      });
    });
    */

    it('should handle errors in validation', () => {
      const error = new Error('Test');
      const fields = {
        foo: {
          type: String,
          custom() { throw error; }
        }
      };
      const schema = new Schema(fields);
      const value = 'hello';

      const validator = schema.validate({ foo: value });

      return validator.then(messages => {
        assert.deepStrictEqual(messages, [ { fieldName: 'foo', message: 'error', value: value, error: error } ], 'Failed to set error on field');
      });
    });

    it('should handle asynchronous errors in validation', () => {
      const error = new Error('Test');
      const fields = {
        foo: {
          type: String,
          custom() { return Promise.reject(error); }
        }
      };
      const schema = new Schema(fields);
      const value = 'hello';

      const validator = schema.validate({ foo: value });

      return validator.then(messages => {
        assert.deepStrictEqual(messages, [ { fieldName: 'foo', message: 'error', value: value, error: error } ], 'Failed to set error on field');
      });
    });

    it('should invalidate key not in schema', () => {
      const fields = {
        foo: String
      };
      const schema = new Schema(fields);

      const validator = schema.validate({ bar: 123 });

      return validator.then(messages => {
        assert.deepStrictEqual(messages, [ { fieldName: 'bar', message: 'keyNotInSchema', value: 123 } ], 'Failed to find error in validation');
      });
    });

  });


  describe('Testing custom validation with context', () => {

    it('should fail to validate with invalid parent context', () => {
      const fields = {
        foo: String
      };
      const schema = new Schema(fields);

      assert.throws(() => schema.validate({ bar: 123 }, {}));
    });

    it('should fetch other fields', () => {
      const fields = {
        foo: {
          type: String,
          custom(value, ctx) {
            assert.strictEqual(value, fooValue, 'Failed to pass value to custom validation');
            assert.strictEqual(ctx.field('bar').value, barValue, 'Failed to fetch other field');
          }
        },
        bar: Number
      };
      const schema = new Schema(fields);
      const fooValue = 'hello';
      const barValue = 1234;

      const validator = schema.validate({ foo: fooValue, bar: barValue });

      return validator.then(messages => {
        assert.deepStrictEqual(messages, [], 'Failed to validate');
      });
    });

  });

});
