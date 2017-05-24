

describe('Testing Model', () => {
  const assert = require('assert');

  const normalizeFields = require('../src/normalize-fields');


  it('should normalize empty arguments', () => {
    [
      undefined, null, false, true,
      "", [], {}, () => {}, /./
    ].forEach(fields => {
      assert.deepStrictEqual(normalizeFields(fields), fields, 'Failed normalizing empty argument : ' + JSON.stringify(fields));
    });
  });


  describe('Testing shorthand types', () => {

    it('should normalize array type', () => {
      const fields = {
        foo: [String]
      };
      const expected = {
        foo: { type: [String] }
      };

      assert.deepStrictEqual(normalizeFields(fields), expected, 'Failed normalizing array shorthand');
    });


    it('should normalize array string alias type', () => {
      const fields = {
        foo: ['string']
      };
      const expected = {
        foo: { type: [String] }
      };

      assert.deepStrictEqual(normalizeFields(fields), expected, 'Failed normalizing array shorthand');
    });


    it('should normalize type', () => {
      const fields = {
        foo: String
      };
      const expected = {
        foo: { type: String }
      };

      assert.deepStrictEqual(normalizeFields(fields), expected, 'Failed normalizing shorthand');
    });


    it('should normalize string alias type', () => {
      const fields = {
        foo: 'string'
      };
      const expected = {
        foo: { type: String }
      };

      assert.deepStrictEqual(normalizeFields(fields), expected, 'Failed normalizing shorthand');
    });
  });


  describe('Testing key\'ed types', () => {

    it('should normalize array type', () => {
      const fields = {
        foo: { type: [String] }
      };
      const expected = {
        foo: { type: [String] }
      };

      assert.deepStrictEqual(normalizeFields(fields), expected, 'Failed normalizing array shorthand');
    });


    it('should normalize array string alias type', () => {
      const fields = {
        foo: { type: ['string'] }
      };
      const expected = {
        foo: { type: [String] }
      };

      assert.deepStrictEqual(normalizeFields(fields), expected, 'Failed normalizing array shorthand');
    });


    it('should normalize type', () => {
      const fields = {
        foo: { type: String }
      };
      const expected = {
        foo: { type: String }
      };

      assert.deepStrictEqual(normalizeFields(fields), expected, 'Failed normalizing shorthand');
    });


    it('should normalize string alias type', () => {
      const fields = {
        foo: { type: 'string' }
      };
      const expected = {
        foo: { type: String }
      };

      assert.deepStrictEqual(normalizeFields(fields), expected, 'Failed normalizing shorthand');
    });
  });

});
