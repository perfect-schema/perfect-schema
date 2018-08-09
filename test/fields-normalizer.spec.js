import assert from 'assert';
import { normalizeFields } from '../src/fields-normalizer';


describe('Testing Fields Normalizer', () => {

  it('should fail with invalid field name', () => {
    const schema = {};

    [
      '123'
    ].forEach(fieldName => {
      const fields = {
        [fieldName]: {}
      };

      assert.throws(() => normalizeFields(fields, schema));
    });
  });


  it('should fail with invalid field specification', () => {
    const schema = {};
    const fields = { foo: null };

    assert.throws(() => normalizeFields(fields, schema));
  });


  it('should fail with invalid field type', () => {
    const schema = {};

    [
      undefined, null, NaN,
      { type: null },
      { type: {} },
      { type: { $$type: null }} ,
      { type: { $$type: null, validatorFactory: null } },
      { type: { $$type: null, validatorFactory: () => {} } },
    ].forEach(type => {
      const fields = { foo: type };
      assert.throws(() => normalizeFields(fields, schema));
    });
  });

});
