import assert from 'assert';
import { normalizeFields } from '../src/fields-normalizer';


describe('Testing Fields Normalizer', () => {

  it('should validate primitives', () => {
    class PerfectSchema {};
    const schema = new PerfectSchema();

    const fields = {
      foo: String
    };
    const normalized = normalizeFields(fields, schema, PerfectSchema);

    assert.ok( normalized.foo.type.$$type );
    assert.ok( typeof normalized.foo.validator === 'function' );
  });


  it('should validate sub-schema', () => {
    class PerfectSchema {
      constructor() {
        this._type = {
          $$type: 'test',
          validatorFactory: () => () => {}
        };
      }
    };
    const schema = new PerfectSchema();
    const subSchema = new PerfectSchema();

    const fields = {
      foo: subSchema
    };
    const normalized = normalizeFields(fields, schema, PerfectSchema);

    assert.ok( normalized.foo.type.$$type === 'test' );
    assert.ok( typeof normalized.foo.validator === 'function' );
  });


  it('should fail with invalid field name', () => {
    class PerfectSchema {};
    const schema = new PerfectSchema();

    [
      '123'
    ].forEach(fieldName => {
      const fields = {
        [fieldName]: {}
      };

      assert.throws(() => normalizeFields(fields, schema, PerfectSchema));
    });
  });


  it('should fail with invalid field specification', () => {
    class PerfectSchema {};
    const schema = new PerfectSchema();
    const fields = { foo: null };

    assert.throws(() => normalizeFields(fields, schema, PerfectSchema));
  });


  it('should fail with invalid field type', () => {
    class PerfectSchema {};
    const schema = new PerfectSchema();

    [
      undefined, null, NaN,
      [], [null] [String], [Number], [String, Number],
      { type: [] }, { type: [null] }, { type: [String] }, { type: [Number] }, { type: [String, Number] },
      { type: null },
      { type: {} },
      { type: { $$type: null }} ,
      { type: { $$type: null, validatorFactory: null } },
      { type: { $$type: null, validatorFactory: () => {} } }
    ].forEach(type => {
      const fields = { foo: type };
      assert.throws(() => normalizeFields(fields, schema, PerfectSchema));
    });
  });

});
