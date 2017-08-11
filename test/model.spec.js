

describe('Testing Model', () => {
  const assert = require('assert');

  const Schema = require('../src/schema');
  const Model = require('../src/model');
  const stringValidator = require('../src/types/string');
  const objectValidator = require('../src/types/object');


  function createSchema(fields, options) {
    options = options || {};

    const schema = new Schema(fields, options.options);

    if (!options.defaultValidation) {
      schema._validators = Object.keys(fields || {}).reduce((validators, fieldName) => {
        validators[fieldName] = fields[fieldName].type === String ? stringValidator(fieldName, fields[fieldName]) : objectValidator(fieldName, fields[fieldName]);

        return validators;
      }, {});

      schema.validate = function () { return Promise.resolve(); };
    }

    return schema
  }

  function getFieldMessage(messages, field) {
    const msg = messages.find(m => m.field === field);

    return msg && msg.message;
  }


  it('should validate if model', () => {
    const fields = { foo: String };
    const foo = new Model(createSchema(fields));

    assert.ok(Model.isModel(foo), 'Failed to check model instance');
  });


  it('should not validate with invalid schema', () => {
    [
      undefined, null, true, false, NaN, -1, 0, 1, '', 'test',
      [], {}, () => {}, /./, new Date()

    ].forEach(schema => assert.throws(() => new Model(schema), 'Failed at throwing with invalid schema : ' + JSON.stringify(schema)));
  });


  it('should create new model', () => {
    const fields = { foo: String };
    const foo = new Model(createSchema(fields));

    assert.strictEqual(foo.isValid(), true, 'Failed to have default model validated');
    assert.deepStrictEqual(foo.getData(), {}, 'Failed to fetch raw data from empty model');
  });

  it('shoud mark initially valid only if no field is required', () => {
    const hasRequiredFields = {
      foo: String,
      bar: { type: String, required: true }
    };
    const hasRequiredWithDefaultFields = {
      foo: String,
      bar: { type: String, required: true, defaultValue: 'test' }
    }
    const hasOptionalFields = {
      foo: String, bar: String
    };

    const fooRequired = new Model(createSchema(hasRequiredFields));
    const fooRequiredDefault = new Model(createSchema(hasRequiredWithDefaultFields));
    const fooOptional = new Model(createSchema(hasOptionalFields));

    assert.strictEqual(fooRequired.isValid(), false, 'Required field is initially valid');
    assert.strictEqual(fooRequiredDefault.isValid(), true, 'Required field is initially invalid with defaults');
    assert.strictEqual(fooOptional.isValid(), true, 'Optional field is initially invalid');
  });


  describe('Testing getting fields', () => {

    it('should throw with invalid field', () => {
      const schema = createSchema({
        foo: { type: String }
      });
      const model = new Model(schema);

      [
        true, false, null, NaN,
        Infinity, NaN,
        new Date(), {}, [], () => {}, /./
      ].forEach(field => {
        assert.throws(() => model.get(field), 'Failed throwing with invalid field : ' + JSON.stringify(field));
      });
    });


    it('should get field (first level)', () => {
      const schema = createSchema({
        foo: { type: String }
      });
      const model = new Model(schema);
      const value = 'hello';

      model._data['foo'] = value;  // hard-code value

      assert.strictEqual(model.get('foo'), value, 'Failed to get model property');
    });


    it('should throw with fields not in schema', () => {
      const schema = createSchema({
        foo: { type: String }
      });
      const model = new Model(schema);
      const value = 'hello';

      model._data['foo'] = value;  // hard-code value

      assert.throws(() => model.get('bar'), 'Failed to throw on invalid field');
    });


    it('should get field recursively', () => {
      const schema = createSchema({
        foo: { type: Object }
      });
      const model = new Model(schema);
      const value = 'hello';

      model._data['foo'] = { bar: { buz: value } };  // hard-code value

      assert.strictEqual(model.get('foo.bar.buz'), value, 'Failed to get model property');
    });


    it('should get field from sub-schema', () => {
      const subSchema = createSchema({
        bar: { type: String }
      });
      const schema = createSchema({
        foo: { type: subSchema }
      });

      const model = new Model(schema);
      const subModel = new Model(subSchema);
      const value = 'hello';

      subModel._data['bar'] = value;  // hard-code value
      model._data['foo'] = subModel;

      assert.strictEqual(model.get('foo.bar'), value, 'Failed to get model property');
    });

    it('should return undefined on missing field', () => {
      const subSchema = createSchema({
        bar: { type: Object }
      });
      const schema = createSchema({
        foo: { type: subSchema }
      });

      const model = new Model(schema);
      const subModel = new Model(subSchema);
      const value = null;

      subModel._data['bar'] = value;  // hard-code value
      model._data['foo'] = subModel;

      assert.strictEqual(model.get('foo.bar'), null, 'Failed to get missing field');
      assert.strictEqual(model.get('foo.bar.buz'), undefined, 'Failed to get missing field');
      assert.strictEqual(model.get('foo.bar.buz.meh'), undefined, 'Failed to get missing field');
    });

    it('should return model from data', () => {
      const subSchema = createSchema({
        bar: String
      });
      const schema = createSchema({
        foo: subSchema
      });
      const model = new Model(schema);

      model._data['foo'] = { bar: 'Hello' };

      const foo = model.get('foo');

      assert.ok(Model.isModel(foo), 'Failed to return model');
      assert.deepStrictEqual(model.getData(), { foo: { bar: 'Hello' }}, 'Failed to extract sub-model data');
    });

    it('should return model from data with sub-model', () => {
      const subSchema = createSchema({
        bar: String
      });
      const schema = createSchema({
        foo: subSchema
      });
      const model = new Model(schema);

      model._data['foo'] = subSchema.createModel();
      model._data['foo']._data['bar'] = 'Hello';

      assert.deepStrictEqual(model.getData(), { foo: { bar: 'Hello' }}, 'Failed to extract sub-model data');
    });

    it('should return model from array of sub-models', () => {
      const subSchema = createSchema({
        bar: String
      });
      const schema = createSchema({
        foo: [subSchema]
      });
      const model = new Model(schema);
      var subModel;

      model._data['foo'] = [];
      for (var i = 0; i < 4; ++i) {
        if (i % 2) {
          subModel = subSchema.createModel();
          subModel._data['bar'] = 'Test ' + i;
        } else {
          subModel = { bar: 'Test ' + i };
        }

        model._data['foo'][i] = subModel;
      }

      assert.deepStrictEqual(model.getData(), { foo: [ { bar: 'Test 0' }, { bar: 'Test 1' }, { bar: 'Test 2' }, { bar: 'Test 3' } ] }, 'Failed to extract sub-model data');
    });

  });

  describe('Testing setting fields', () => {

    it('should set field (first level)', () => {
      const schema = createSchema({
        foo: { type: String }
      });
      const model = new Model(schema);
      const value = 'hello';

      model.set('foo', value);

      assert.strictEqual(model._data['foo'], value, 'Failed to set model property');
      assert.deepStrictEqual(model.getData(), { foo: value }, 'Failed to fetch raw data');
    });


    it('should throw with fields not in schema', () => {
      const schema = createSchema({
        foo: { type: String }
      });
      const model = new Model(schema);
      const value = 'hello';

      assert.throws(() => model.set('bar', value), 'Failed to throw on invalid field');
    });


    it('should set field recursively', () => {
      const schema = createSchema({
        foo: { type: Object }
      });
      const model = new Model(schema);
      const value = 'hello';

      model.set('foo.bar.buz', value);

      assert.deepStrictEqual(model._data['foo'], { bar: { buz: value } }, 'Failed to set model property');
    });

    it('should set field to sub-schema', () => {
      const subSchema = createSchema({
        bar: { type: String }
      });
      const schema = createSchema({
        foo: { type: subSchema }
      });

      const model = new Model(schema);
      const subModel = new Model(subSchema);
      const value1 = 'hello';
      const value2 = 'world';

      model.set('foo.bar', value1);
      assert.strictEqual(model._data['foo']._data['bar'], value1, 'Failed to set model property with value1');

      model.set('foo.bar', value2);
      assert.strictEqual(model._data['foo']._data['bar'], value2, 'Failed to set model property with value2');
    });

    it('should fail to get invalid field type', () => {
      const subSchema = createSchema({
        bar: { type: String }
      });
      const schema = createSchema({
        foo: { type: subSchema },
        buz: { type: String }
      });

      const model = new Model(schema);
      const subModel = new Model(subSchema);
      const value = 'hello';

      assert.throws(() => subModel.set('foo', value), 'Failed to throw setting invalid field');
      assert.throws(() => subModel.set('foo.bar', value), 'Failed to throw setting invalid field');
      assert.throws(() => subModel.set('bar.foo', value), 'Failed to throw setting invalid field');
      assert.throws(() => model.set('bar', value), 'Failed to throw setting invalid field');
      assert.throws(() => model.set('bar.foo', value), 'Failed to throw setting invalid field');
      assert.throws(() => model.set('foo.bar.buz', value), 'Failed to throw setting invalid field');
    });

    it('should set multiple values', () => {
      const schema = createSchema({
        foo: { type: Object },
        bar: { type: Object }
      });
      const model = new Model(schema);
      const value = {
        foo: { test: 'hello' },
        'bar.test': 'world'
      };
      const expected = {
        foo: { test: 'hello' },
        bar: { test: 'world' }
      };

      model.set(value);

      assert.deepStrictEqual(model._data, expected, 'Failed to set multiple values');
    });


    it('should set multiple values from empty object', () => {
      const schema = createSchema({
        foo: { type: Object },
        bar: { type: Object }
      });
      const model = new Model(schema);
      const value = {};
      const expected = {};

      model.set(value);
      assert.deepStrictEqual(model._data, expected, 'Failed to set empty values');
    });

    it('should set data from sub-model', () => {
      const subSchema = createSchema({
        bar: String
      });
      const schema = createSchema({
        foo: subSchema
      });
      const model = new Model(schema);
      const subModel = new Model(subSchema);

      subModel._data['bar'] = 'Test';
      model._data['foo'] = subModel;

      return new Model(schema).set(model).then(otherModel => {
        assert.deepStrictEqual(model.getData(), otherModel.getData(), 'Failed to set other model from model');
      });
    });

  });


  describe('Testing validation', () => {

    it('should validate simple model', () => {
      const schema = createSchema({
        foo: { type: String }
      });
      const model = schema.createModel();
      const value = 'Hello';
      const validationMessages = [ { field: 'foo', message: 'Validation Test', value: value } ];

      schema.validate = function (data) {
        assert.deepStrictEqual(data, { foo: value }, 'Failed to pass data to validate function');

        return Promise.resolve(validationMessages);
      };

      assert.strictEqual(model.isValid(), true, 'Model is initially invalid');

      const validator = model.set('foo', value);

      return validator.then(() => {
        const messages = model.getMessages();

        assert.deepStrictEqual(messages, validationMessages, 'Failed to return validation messages');

        assert.strictEqual(model.isValid(), false, 'Failed to set invalid with error messages set');
      });
    });

    it('should cleanup invalidated error messages', () => {
      const schema = createSchema({
        foo: { type: String }
      });
      const model = schema.createModel();
      const value1 = 'Hello';
      const validationMessages1 = [ { field: 'foo', message: 'Validation Test 1', value: value1 } ];

      schema.validate = function (data) {
        return Promise.resolve(validationMessages1);
      };

      const validator1 = model.set('foo', value1);

      return validator1.then(() => {
        const value2 = 'World';
        const validationMessages2 = [ { field: 'foo', message: 'Validation Test 2', value: value2 } ];

        assert.strictEqual(model.isValid(), false, 'Failed to set invalid with error messages set 1');
        assert.deepStrictEqual(model.getMessages(), validationMessages1, 'Failed to return validation messages 1');

        schema.validate = function (data) {
          return Promise.resolve(validationMessages2);
        };

        const validator2 = model.set('foo', value2);

        return validator2.then(() => {
          assert.strictEqual(model.isValid(), false, 'Failed to set invalid with error messages set 2');
          assert.deepStrictEqual(model.getMessages(), validationMessages2, 'Failed to return validation messages 2');

          schema.validate = function (data) {
            return Promise.resolve([]);
          };

          const validator3 = model.set('foo', 'something');

          return validator3.then(() => {
            assert.strictEqual(model.isValid(), true, 'Failed to set valid with no error messages set 3');

            assert.strictEqual(model.getMessages(), null, 'Failed to return validation messages 3');
          });
        });
      });
    });

    it('should validate two fields independently', () => {
      const schema = createSchema({
        foo: { type: String },
        bar: { type: Number }
      });
      const model = schema.createModel();

      const valueFoo = 'Hello';
      const valueBar = 123;
      const validationMessages = [
        { field: 'foo', message: 'Validation Test Foo', value: valueFoo },
        { field: 'bar', message: 'Validation Test Bar', value: valueBar }
      ];

      schema.validate = function (data) {
        return Promise.resolve(validationMessages);
      };

      const validator = Promise.all([ model.set('foo', valueFoo), model.set('bar', valueBar) ]);

      return validator.then(allMessages => {
        assert.strictEqual(model._messages.length, 2, 'Failed to set error message correctly');
        assert.strictEqual(model.isValid(), false, 'Failed to set invalid with error messages set');
      });
    });

    it('should validate multiple fields', () => {
      const schema = createSchema({
        foo: { type: String },
        bar: { type: Number }
      });
      const model = schema.createModel();

      const valueFoo = 'Hello';
      const valueBar = 123;
      const validationMessages = [
        { field: 'foo', message: 'Validation Test Foo', value: valueFoo },
        { field: 'bar', message: 'Validation Test Bar', value: valueBar }
      ];

      schema.validate = function (data) {
        return Promise.resolve(validationMessages);
      };

      const validator = model.set({ 'foo': valueFoo, 'bar': valueBar });

      return validator.then(allMessages => {
        assert.strictEqual(model._messages.length, 2, 'Failed to set error message correctly');
        assert.strictEqual(model.isValid(), false, 'Failed to set invalid with error messages set');
      });
    });


    it('should fetch field messages', () => {
      const schema = createSchema({
        foo: { type: String },
        bar: { type: Number }
      });
      const model = schema.createModel();

      const valueFoo = 'Hello';
      const valueBar = 123;
      const validationMessages = [
        { field: 'foo', message: 'Validation Test Foo', value: valueFoo },
        { field: 'bar', message: 'Validation Test Bar', value: valueBar }
      ];

      schema.validate = function (data) {
        return Promise.resolve(validationMessages);
      };

      assert.deepStrictEqual(model.getMessages('foo'), null, 'Failed to fetch null');
      assert.deepStrictEqual(model.getMessages('bar'), null, 'Failed to fetch null');
      assert.deepStrictEqual(model.getMessages(), null, 'Failed to fetch null');

      const validator = model.set({ 'foo': valueFoo, 'bar': valueBar });

      return validator.then(allMessages => {
        assert.deepStrictEqual(model.getMessages().length, validationMessages.length, 'Failed to fetch all messages');
        assert.deepStrictEqual(model.getMessages('foo'), [validationMessages[0]], 'Failed to fetch messages for foo');
        assert.deepStrictEqual(model.getMessages('bar'), [validationMessages[1]], 'Failed to fetch messages for bar');
      });
    });

    it('should not be valid if required field no set', () => {
      const schema = createSchema({
        foo: {
          type: String,
          required: true
        },
        bar: {
          type: String,
          required: true
        }
      });
      const model = schema.createModel();

      assert.ok(!model.isValid(), 'Failed at initializing invalid model');

      return model.set('bar', 'Test').then(() => {
        assert.ok(!model.isValid(), 'Failed at preserving invalid state');
      });
    });


    it('should invalidate nested model', () => {
      const subSchema = createSchema({
        bar: String
      }, { defaultValidation: true });
      const schema = createSchema({
        foo: subSchema
      }, { defaultValidation: true });

      const subModel = subSchema.createModel();
      const model = schema.createModel();

      subModel._data.bar = 123; // invalid type
      model._data.foo = subModel;

      return model.validate(true).then(() => {
        //console.log(model.isValid(), model.getMessages(), subModel.isValid(), subModel.getMessages());
        assert.ok(!subModel.isValid(), 'Sub-model was not invalidated');
      });
    });

  });


  describe('Testing integration with Schema', () => {

    it('should invalidate nested models', () => {
      const barFields = {
        bar: String
      };
      const barSchema = new Schema(barFields);
      const fooFields = {
        foo: barSchema,
        bob: String
      };
      const fooSchema = new Schema(fooFields);

      const fooModel = fooSchema.createModel();

      return fooModel.set({ foo: { bar: 123 }, bob: 456 }).then(() => {
        const messages = fooModel.getMessages();

        assert.strictEqual(fooModel._data['foo']._data['bar'], 123, 'Failed to create sub model');
        assert.strictEqual(fooModel._data['bob'], 456, 'Failed to create sub model');

        assert.strictEqual(fooModel.get('foo.bar'), 123, 'Failed to fetch recursively');

        assert.deepStrictEqual(getFieldMessage(messages, 'foo'), 'invalid', 'Failed to invalidate foo');
        assert.deepStrictEqual(getFieldMessage(messages, 'bob'), 'invalidType', 'Failed to invalidate bob');

        return fooModel.set('foo', { bar: null }).then(() => {
          const messages = fooModel.getMessages();

          assert.strictEqual(fooModel._data['foo']._data['bar'], null, 'Failed to update sub model');

          assert.deepStrictEqual(getFieldMessage(messages, 'foo'), 'invalid', 'Failed to invalidate foo');
          assert.deepStrictEqual(getFieldMessage(messages, 'bob'), 'invalidType', 'Failed to invalidate bob');

          return fooModel.set('foo.bar', 'hello').then(() => {
            const messages = fooModel.getMessages();

            assert.strictEqual(fooModel._data['foo']._data['bar'], 'hello', 'Failed to update sub model');

            assert.deepStrictEqual(getFieldMessage(messages, 'bob'), 'invalidType', 'Failed to invalidate bob');
          });
        })
      });
    });

  });


  describe('Testing model validation', () => {

    it('should validate empty model', () => {
      const fooSchema = createSchema({ foo: String });
      const fooModel = fooSchema.createModel();

      return fooModel.validate().then(messages => {
        assert.ok(!messages.length, 'Validation errors when there was none');
      });
    });

    it('should not run double validation for the same field', () => {
      const fooSchema = createSchema({
        foo: {
          type: String,
          custom(value) {
            // note : shorter delay for valid values
            const delay = typeof value === 'string' ? 0 : 100;
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(undefined);
              }, delay);
            });
          }
        }
      });
      const fooModel = fooSchema.createModel();

      return Promise.all([
        fooModel.set('foo', 123 /* invalid value */).then(messages => {
          assert.ok(!messages.length, 'Failed to ignore previous asynchronous set');
        }),
        fooModel.set('foo', "hello" /* invalid value */).then(messages => {
          assert.ok(!messages.length, 'Failed to validate');
        }),
        fooModel.validate().then(messages => {
          assert.ok(!messages.length, 'Failed validation');
        })
      ]);
    });

    it('should validate manually set fields', () => {
      const fooSchema = createSchema({ foo: String }, { defaultValidation: true });
      const fooModel = fooSchema.createModel();

      fooModel._data['foo'] = 123;

      return fooModel.validate().then(() => {
        const messages = fooModel.getMessages();

        // remove ts from messages...
        messages.forEach(msg => delete msg.ts);

        assert.deepStrictEqual(messages, [{ field: 'foo', message: 'invalidType', value: 123 }], 'Failed to validate model');
      });
    });

    it('should validate specific fields', () => {
      const schema = createSchema({
        foo: String,
        bar: Number,
        buz: Boolean
      }, {
        defaultValidation: true
      });
      const model = schema.createModel();

      // override data
      model._data = {
        foo: 123,
        bar: '123',
        buz: 123
      };

      // first validation (all fields)
      return model.validate().then(() => {
        const messages = model.getMessages();

        assert.strictEqual(messages.length, 3, 'Something went wrong with first validation');

        model._messages = [];

        // specific fields (object)
        return model.validate({ fields: { foo: true, bar: false, buz: true } });
      }).then(() => {
        assert.strictEqual(model.getMessages().length, 2, 'Invalid field validation');

        assert.strictEqual(model.getMessages('foo').length, 1, 'Did not revalidate foo');
        assert.ok(!model.getMessages('bar'), 'Failed at ignoring bar');
        assert.strictEqual(model.getMessages('buz').length, 1, 'Did not revalidate buz');

        model._messages = [];

        // specific fields 2 (object)
        return model.validate({ fields: { bar: true } });
      }).then(() => {
        assert.strictEqual(model.getMessages().length, 1, 'Invalid field validation');

        assert.ok(!model.getMessages('foo'), 'Failed at ignoring foo');
        assert.strictEqual(model.getMessages('bar').length, 1, 'Did not revalidate bar');
        assert.ok(!model.getMessages('buz'), 'Failed at ignoring buz');

        model._messages = [];

        // specific fields 3 (array)
        return model.validate({ fields: ['buz', 'bar'] });
      }).then(() => {
        assert.strictEqual(model.getMessages().length, 2, 'Invalid field validation');

        assert.ok(!model.getMessages('foo'), 'Failed at ignoring foo');
        assert.strictEqual(model.getMessages('bar').length, 1, 'Did not revalidate bar');
        assert.strictEqual(model.getMessages('buz').length, 1, 'Did not revalidate buz');

        model._messages = [];

        // specific fields 4 (empty array)
        return model.validate([]);
      }).then(() => {

        assert.ok(!model.getMessages(), 'Failed at validating no fields');

        // specific fields 5 (revalidate)
        return model.validate();
      }).then(() => {
        // NOTE : manually reset messages are not updated if model didn't find changes...
        assert.ok(!model.getMessages(), 'Failed at validating all (no args)');

        model._data.foo = '123';

        return model.validate();  // ignored
      }).then(() => {
        // NOTE : same thing as above...
        assert.ok(!model.getMessages(), 'Failed at validating all (repeated no args)');

        // force revalidation
        return model.validate({ revalidate : true });
      }).then(() => {
        const messages = model.getMessages();

        assert.strictEqual(messages.length, 2, 'Failed at validating all');

        return model.validate();
      }).then(() => {
        // NOTE : old error messages should not be reset
        assert.strictEqual(model.getMessages().length, 2, 'Failed at preserving old error messages');
      });
    });

    it('should fail with invalid field names', () => {
      const schema = createSchema({
        foo: String,
      }, {
        defaultValidation: true
      });
      const model = schema.createModel();

      assert.throws(() => model.validate({ fields: { bar: true } }));
      assert.throws(() => model.validate({ fields: { bar: 1 } }));
      assert.throws(() => model.validate({ fields: ['bar'] }));
    });

    it('should update field error message', () => {
      const schema = createSchema({
        foo: {
          type: String,
          min: 3
        }
      }, {
        defaultValidation: true
      });
      const model = schema.createModel();

      return model.set({ foo: 'hi' }).then(() => {
        assert.strictEqual(getFieldMessage(model.getMessages(), 'foo'), 'minString', 'Failed to validate minString');

        return model.set({ foo: 123 });
      }).then(() => {
        assert.strictEqual(getFieldMessage(model.getMessages(), 'foo'), 'invalidType', 'Failed to validate invalidType');

        return model.set({ foo: 'hello' });
      }).then(() => {
        assert.ok(!model.getMessages(), 'Failed to validate foo');
      });

    });


    it('should not validate with invalid context', () => {
      const schema = createSchema({
        foo: String
      });
      const model = schema.createModel();

      [
        true, Infinity, 'test', 123,
        new Date(), {}, [], /./
      ].forEach(context => {
        assert.throws(() => model.validate({ context }), 'Failed throwing with invalid context : ' + JSON.stringify(context));
      });
    });

  });


  describe('Testing default values', () => {

    it('should set defaults on model creation', () => {
      const schema = createSchema({
        foo: {
          type: String,
          defaultValue: 'hello'
        },
        bar: {
          type: Number,
          defaultValue: 0
        }
      }, {
        defaultValidation: true
      });
      const model = schema.createModel();

      assert.strictEqual(model.get('foo'), 'hello', 'Failed to set default string');
      assert.strictEqual(model.get('bar'), 0, 'Failed to set default number');
      assert.deepStrictEqual(model.getData(), { foo: 'hello', bar: 0 }, 'Failed to fetch raw data from model');
    });

  });

});
