

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


  it('should fail with invalid array type', () => {
    [
      [], [null, null]
    ].forEach(type => {
      assert.throws(() => validatorBuilder({ foo: type }));
      assert.throws(() => validatorBuilder({ foo: { type: type } }));
    });
  });


  it('should fail with invalid type', () => {
    [
      [[]],
      [null], null,
      [undefined], undefined
    ].forEach(type => {
      assert.throws(() => validatorBuilder({ foo: type }));
      assert.throws(() => validatorBuilder({ foo: { type: type } }));
    });
  });


  it('should build with schema instances', () => {
    const subFields = {
      validate(value) {
        return value.bar === true || 'Failed';
      }
    };
    const fields = {
      foo: subFields
    };
    const fieldValidators = validatorBuilder(fields);

    assert.strictEqual(fieldValidators.foo({ bar: true }), undefined, 'Failed validation with valid value');
    assert.notStrictEqual(fieldValidators.foo({ bar: false }), undefined, 'Failed validation with invalid value');
  });


  it('should build required field validator', () => {
    const optionalFields = {
      foo: {
        type: String,
        required: false
      }
    };
    const optionalValidator = validatorBuilder(optionalFields);
    const requiredFields = {
      foo: {
        type: String,
        required: true
      }
    };
    const requiredValidator = validatorBuilder(requiredFields);

    assert.strictEqual(optionalValidator.foo(), undefined, 'Failed optional validator');
    assert.strictEqual(optionalValidator.foo(undefined), undefined, 'Failed optional validator');
    assert.strictEqual(optionalValidator.foo(null), 'invalidType', 'Failed optional validator');  // non nullable is not the same as optional
    assert.strictEqual(optionalValidator.foo('test'), undefined, 'Failed optional validator');
    assert.strictEqual(requiredValidator.foo(), 'required', 'Failed required validator');
    assert.strictEqual(requiredValidator.foo(undefined), 'required', 'Failed required validator');
    assert.strictEqual(requiredValidator.foo(null), 'invalidType', 'Failed optional validator');  // required is not nullable
    assert.strictEqual(requiredValidator.foo('test'), undefined, 'Failed required validator');
  });


  it('should build nullable field validator', () => {
    const optionalFields = {
      foo: {
        type: String,
        required: false,
        nullable: true
      }
    };
    const optionalValidator = validatorBuilder(optionalFields);
    const requiredFields = {
      foo: {
        type: String,
        required: true,
        nullable: true
      }
    };
    const requiredValidator = validatorBuilder(requiredFields);

    assert.strictEqual(optionalValidator.foo(), undefined, 'Failed optional validator');
    assert.strictEqual(optionalValidator.foo(undefined), undefined, 'Failed optional validator');
    assert.strictEqual(optionalValidator.foo(null), undefined, 'Failed optional validator');
    assert.strictEqual(optionalValidator.foo('test'), undefined, 'Failed optional validator');
    assert.strictEqual(requiredValidator.foo(), 'required', 'Failed required validator');
    assert.strictEqual(requiredValidator.foo(undefined), 'required', 'Failed required validator');
    assert.strictEqual(requiredValidator.foo(null), undefined, 'Failed optional validator');
    assert.strictEqual(requiredValidator.foo('test'), undefined, 'Failed required validator');
  });


  it('should build custom field validation', () => {
    const fields = {
      foo: {
        type: String,
        custom(value) {
          return value === 'bar' || 'invalid';
        }
      }
    };
    const fieldValidators = validatorBuilder(fields);

    assert.strictEqual(fieldValidators.foo('bar'), undefined, 'Failed custom valid value');
    assert.strictEqual(fieldValidators.foo('err'), 'invalid', 'Failed custom invalid value');
  });

});
