

describe('Testing Perfect-Schema', () => {
  const assert = require('assert');

  const PerfectSchema = require('../src/perfect-schema');

  it('should not create without fields', () => {
    assert.throws(() => { new PerfectSchema(); }, TypeError);

    [
      undefined, null, true, false, NaN, {}
    ].forEach(fields => assert.throws(() => { new PerfectSchema(fields); }, TypeError));
  });


  it('should construct new instance', () => {
    const fields = {
      foo: String
    };

    const schema = new PerfectSchema(fields);

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

    const schema = new PerfectSchema(baseFields);

    assert.strictEqual(schema._fieldNames.length, 1, 'Mismatch field names');

    schema.extends(extendedFields);

    //assert.strictEqual(schema._fieldNames.length, 2, 'Mismatch field names');

  });


});
