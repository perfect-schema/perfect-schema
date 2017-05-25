

describe('Testing Model', () => {
  const assert = require('assert');

  const Model = require('../src/model');
  const stringValidator = require('../src/validators/string');
  const objectValidator = require('../src/validators/object');


  function PerfectSchema(fields) {
    this._fields = fields;
    this._validators = Object.keys(fields || {}).reduce((validators, fieldName) => {
      validators[fieldName] = fields[fieldName].type === String ? stringValidator : objectValidator;

      return validators;
    }, {});
    this._options = {};
    this.validate = function () { return Promise.resolve(); };
    this.createModel = function () {
      return new Model(this);
    };
  }



  it('should create new model', () => {
    const foo = new Model(new PerfectSchema());

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
      const schema = new PerfectSchema({
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
      const schema = new PerfectSchema({
        foo: { type: String }
      });
      const model = new Model(schema);
      const value = 'hello';

      model._data['foo'] = value;  // hard-code value

      assert.strictEqual(model.get('foo'), value, 'Failed to get model property');
    });


    it('should throw with fields not in schema', () => {
      const schema = new PerfectSchema({
        foo: { type: String }
      });
      const model = new Model(schema);
      const value = 'hello';

      model._data['foo'] = value;  // hard-code value

      assert.throws(() => model.get('bar'), 'Failed to throw on invalid field');
    });


    it('should get field recursively', () => {
      const schema = new PerfectSchema({
        foo: { type: Object }
      });
      const model = new Model(schema);
      const value = 'hello';

      model._data['foo'] = { bar: { buz: value } };  // hard-code value

      assert.strictEqual(model.get('foo.bar.buz'), value, 'Failed to get model property');
    });


    it('should get field from sub-schema', () => {
      const subSchema = new PerfectSchema({
        bar: { type: String }
      });
      const schema = new PerfectSchema({
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
      const subSchema = new PerfectSchema({
        bar: { type: String }
      });
      const schema = new PerfectSchema({
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
      const subSchema = new PerfectSchema({
        bar: { type: Object }
      });
      const schema = new PerfectSchema({
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
      const schema = new PerfectSchema({
        foo: { type: String }
      });
      const model = new Model(schema);
      const value = 'hello';

      model.set('foo', value);

      assert.strictEqual(model._data['foo'], value, 'Failed to set model property');
    });


    it('should throw with fields not in schema', () => {
      const schema = new PerfectSchema({
        foo: { type: String }
      });
      const model = new Model(schema);
      const value = 'hello';

      assert.throws(() => model.set('bar', value), 'Failed to throw on invalid field');
    });


    it('should set field recursively', () => {
      const schema = new PerfectSchema({
        foo: { type: Object }
      });
      const model = new Model(schema);
      const value = 'hello';

      model.set('foo.bar.buz', value);

      assert.deepStrictEqual(model._data['foo'], { bar: { buz: value } }, 'Failed to set model property');
    });


    it('should set field to sub-schema', () => {
      const subSchema = new PerfectSchema({
        bar: { type: String }
      });
      const schema = new PerfectSchema({
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
      const subSchema = new PerfectSchema({
        bar: { type: String }
      });
      const schema = new PerfectSchema({
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

  });

});
