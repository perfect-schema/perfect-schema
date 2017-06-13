

describe('Testing Model', () => {
  const assert = require('assert');

  const Schema = require('../src/schema');
  const Model = require('../src/model');
  const stringValidator = require('../src/validators/string');
  const objectValidator = require('../src/validators/object');


  function createSchema(fields, options) {
    options = options || {};

    const schema = new Schema(fields, options.options);

    if (!options.defaultValidators) {
      this._validators = Object.keys(fields || {}).reduce((validators, fieldName) => {
        validators[fieldName] = fields[fieldName].type === String ? stringValidator : objectValidator;

        return validators;
      }, {});
    }

    if (!options.defaultValidation) {
      this.validate = function () { return Promise.resolve(); };
    }

    return schema
  }


  it('should validate if model', () => {
    const fields = { foo: String };
    const foo = new Model(createSchema(fields));

    assert.ok(Model.isModel(foo), 'Failed to check model instance');
  });


  it('should create new model', () => {
    const fields = { foo: String };
    const foo = new Model(createSchema(fields));

    assert.strictEqual(foo.isValid(), true, 'Failed to have default model validated');
  });


  it('should fail with invalid schema', () => {
    [
      true, false, null, NaN,
      Infinity, NaN,
      new Date(), {}, [], () => {}, /./
    ].forEach(schema => {
      assert.throws(() => new Model(schema), 'Failed throwing with invalid schema : ' + JSON.stringify(schema));
    });
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

      subModel._data['bar'] = value;  // hard-code value
      model._data['foo'] = subModel;

      assert.throws(() => model.get('foo.bar.buz'), 'Failed throwing on invalid field type : foo.bar.buz');
      assert.throws(() => model.get('foo.buz.bar'), 'Failed throwing on invalid field type : foo.bar.buz');
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

      return validator.then(messages => {
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

      return validator1.then(messages1 => {
        const value2 = 'World';
        const validationMessages2 = [ { field: 'foo', message: 'Validation Test 2', value: value2 } ];

        assert.strictEqual(model.isValid(), false, 'Failed to set invalid with error messages set 1');
        assert.deepStrictEqual(messages1, validationMessages1, 'Failed to return validation messages 1');

        schema.validate = function (data) {
          return Promise.resolve(validationMessages2);
        };

        const validator2 = model.set('foo', value2);

        return validator2.then(messages2 => {
          assert.strictEqual(model.isValid(), false, 'Failed to set invalid with error messages set 2');
          assert.deepStrictEqual(messages2, validationMessages2, 'Failed to return validation messages 2');

          schema.validate = function (data) {
            return Promise.resolve([]);
          };

          const validator3 = model.set('foo', 'something');

          return validator3.then(messages3 => {
            assert.strictEqual(model.isValid(), true, 'Failed to set valid with no error messages set 3');
            assert.deepStrictEqual(messages3, [], 'Failed to return validation messages 3');
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

      const validator = model.set({ 'foo': valueFoo, 'bar': valueBar });

      return validator.then(allMessages => {
        assert.deepStrictEqual(model.getMessages('foo'), [validationMessages[0]], 'Failed to fetch messages for foo');
        assert.deepStrictEqual(model.getMessages('bar'), [validationMessages[1]], 'Failed to fetch messages for bar');
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

      return fooModel.set({ foo: { bar: 123 }, bob: 456 }).then(messages => {
        assert.strictEqual(fooModel._data['foo']._data['bar'], 123, 'Failed to create sub model');

        // remove ts from messages...
        messages.forEach(msg => delete msg.ts);

        assert.deepStrictEqual(messages, [
          { field: 'bob', message: 'invalidType', value: 456 },
          { field: 'foo', message: 'invalid', value: fooModel._data['foo'] }
        ], 'Failed to find error in validation');

        return fooModel.set('foo', { bar: null }).then(messages => {
          assert.strictEqual(fooModel._data['foo']._data['bar'], null, 'Failed to update sub model');

          // remove ts from messages...
          messages.forEach(msg => delete msg.ts);

          assert.deepStrictEqual(messages, [
            { field: 'bob', message: 'invalidType', value: 456 },
            { field: 'foo', message: 'invalid', value: fooModel._data['foo'] }
          ], 'Failed to find error in validation');

          return fooModel.set('foo.bar', 'hello').then(messages => {
            assert.strictEqual(fooModel._data['foo']._data['bar'], 'hello', 'Failed to update sub model');

            // remove ts from messages...
            messages.forEach(msg => delete msg.ts);

            assert.deepStrictEqual(messages, [
              { field: 'bob', message: 'invalidType', value: 456 }
            ], 'Failed to remove invalidated validation error');
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
      const fooSchema = createSchema({ foo: String });
      const fooModel = fooSchema.createModel();

      fooModel._data['foo'] = 123;

      return fooModel.validate().then(messages => {
        // remove ts from messages...
        messages.forEach(msg => delete msg.ts);

        assert.deepStrictEqual(messages, [{ field: 'foo', message: 'invalidType', value: 123 }], 'Failed to validate model');
      });
    });

  });


});
