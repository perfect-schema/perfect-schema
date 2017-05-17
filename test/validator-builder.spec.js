

describe('Testing validator builder', () => {
  const assert = require('assert');

  const validatorBuilder = require('../src/validator-builder');
  const validators = require('../src/validators');
  const any = require('../src/any');

  it('should build with no fields', () => {

    assert.deepEqual(validatorBuilder(), {}, 'Failed with no arguments');

    [
      undefined, null, false, '', {}, [], 0
    ].forEach(fields => assert.deepEqual(validatorBuilder(fields), {}, 'Failed with no argument : ' + JSON.stringify(fields)));
  });

  it('should build with primitives', () => {
    [
      [Boolean, true, 'true'], ['boolean', true, 'true'],
      [String, 'abc', 123], ['string', 'abc', 123],
      [Object, {}, []], ['object', {}, []],
      [Array, [], 'abc'], ['array', [], 'abc'],
      [Date, new Date(), 'abc'], ['date', new Date(), 'abc'],
      [Number, 123.456, 'abc'], ['number', 123.456, 'abc'],
      [validators['integer'].Type, 123, 123.456], ['integer', 123, 123.456],
    ].forEach(options => {
      const fields = { foo: options[0] };
      const fieldValidators = validatorBuilder(fields);

      assert.deepEqual(Object.keys(fieldValidators), Object.keys(fields), 'Field mismatch in validators');
      assert.strictEqual(fieldValidators.foo(options[1]), undefined, 'Failed validation');
      assert.strictEqual(fieldValidators.foo(options[2]), 'invalidType', 'Failed invalid validation');
    });
  });

  it('should build with "any" (wildcard)', () => {
    const fields = {
      foo: any()
    };
    const fieldValidators = validatorBuilder(fields);

    // valid for any value...
    [
      true, false, null, "", "abc",
      -1, 0, 1, Infinity, NaN,
      new Date(), {}, [], () => {}, /./
    ].forEach(value => {
      assert.strictEqual(fieldValidators.foo(value), undefined, 'Failed validation');
    });
  });

  it('should build with "any" given types', () => {
    const fields = {
      foo: any(String, { type: Number, min: 1, max: 3 }, { type: 'integer', min: 5, max: 10 })
    };
    const fieldValidators = validatorBuilder(fields);

    // valid with these values...
    [
      "", "abc",
      1, 1.5, 2, 2.5, 3,
      5, 6, 7, 8, 9, 10
    ].forEach(value => {
      assert.strictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value));
    });

    // invalid with these values...
    [
      0.5, 3.1, 7.5, 9.99,
    ].forEach(value => {
      assert.notStrictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value));
    });

    // invalid with these types...
    [
      true, false, null,
      Infinity, NaN,
      new Date(), {}, [], () => {}, /./
    ].forEach(value => {
      assert.strictEqual(fieldValidators.foo(value), 'invalidType', 'Failed validation : ' + JSON.stringify(value));
    });
  });

  it('should build with arrays (shorthand)', () => {
    const fields = {
      foo: [String]
    };
    const fieldValidators = validatorBuilder(fields);

    // valid with these values...
    [
      [], [""], ["abc"], ["", "abc"]
    ].forEach(value => {
      assert.strictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value));
    });

    // invalid with these types...
    [
      true, false, null, "", "abc",
      Infinity, NaN,
      new Date(), {}, () => {}, /./, [null]
    ].forEach(value => {
      assert.strictEqual(fieldValidators.foo(value), 'invalidType', 'Failed validation : ' + JSON.stringify(value));
    });
  });

  it('should build with arrays (arrayOptions)', () => {
    const fields = {
      foo: {
        type: [String],
        arrayOptions: {
          min: 2
        },
        min: 3
      }
    };
    const fieldValidators = validatorBuilder(fields);

    // valid with these values...
    [
      ["abc", "defg", "hijkl"]
    ].forEach(value => {
      assert.strictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value));
    });

    // invalid with these types...
    [
      true, false, null, "", "abc",
      Infinity, NaN,
      new Date(), {}, () => {}, /./,
      [], [""], ["", "", ""], ["abc", "", "def"]
    ].forEach(value => {
      assert.notStrictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value));
    });
  });


  it('should build with schema instances');


});
