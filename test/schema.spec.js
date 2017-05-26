

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


  describe('Testing validation', () => {

    it('should validate simple data set', (done) => {
      const fields = {
        foo: String
      };
      const schema = new Schema(fields);

      const validator = schema.validate({ foo: 'hello' });

      console.log(validator);

      validator.validationPromise().then(messages => {
        console.log(messages);

        done();
      });

    });

  });

});
