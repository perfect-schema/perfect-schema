

describe('Testing validator builder', () => {
  const assert = require('assert');

  const validatorBuilder = require('../src/validator-builder');
  const validators = require('../src/validators');
  const Schema = require('../src/schema');
  const any = require('../src/any');

  it('should build with no fields', () => {

    assert.deepEqual(validatorBuilder(), {}, 'Failed with no arguments');

    [
      undefined, null, false, '', {}, [], 0
    ].forEach(fields => assert.deepEqual(validatorBuilder(fields), {}, 'Failed with no argument : ' + JSON.stringify(fields)));
  });


  it('should build with primitives', () => {
    [
      [Boolean, true, 'true'],
      [String, 'abc', 123],
      [Object, {}, []],
      [Array, [], 'abc'],
      [Date, new Date(), 'abc'],
      [Number, 123.456, 'abc'],
      [validators['integer'].Type, 123, 123.456]
    ].forEach(options => {
      const fields = { foo: options[0] };
      const fieldValidators = validatorBuilder(fields);

      assert.deepEqual(Object.keys(fieldValidators), Object.keys(fields), 'Field mismatch in validators');
      assert.strictEqual(fieldValidators.foo(options[1]), undefined, 'Failed validation');
      assert.strictEqual(fieldValidators.foo(options[2]), 'invalidType', 'Failed invalid validation');
    });
  });


  it('should map from string to type', () => {
    assert.strictEqual(validators.getType('boolean'), Boolean, 'Mismatch "boolean" > [Boolean]');
    assert.strictEqual(validators.getType('date'), Date, 'Mismatch "date" > [Date]');
    assert.strictEqual(validators.getType('number'), Number, 'Mismatch "number" > [Number]');
    assert.strictEqual(validators.getType('string'), String, 'Mismatch "string" > [String]');
  });


  it('should map identity type if not string', () => {
    [
      true, false, null,
      Infinity,
      new Date(), {}, () => {}, /./,
      [], [""]
    ].forEach(type => {
      assert.strictEqual(validators.getType(type), type, 'Mismatch non string type : ' + JSON.stringify(type));
    });
  });


  it('should not map invalid string type', () => {
    assert.throws(() => {
      validators.getType('invalidType');
    }, 'Failed to throw');
  });


  describe('Testing "any"', () => {

    it('should build with short and wildcard', () => {
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

    it('should build with wildcard', () => {
      const fields = {
        foo: { type: any() }
      };
      const fieldValidators = validatorBuilder(fields);

      // valid for any value...
      [
        true, false, null, "", "abc",
        -1, 0, 1, Infinity, NaN,
        new Date(), {}, [], () => {}, /./
      ].forEach(value => assert.strictEqual(fieldValidators.foo(value), undefined, 'Failed validation'));
    });


    it('should build with given types (explicit)', () => {
      const fields = {
        foo: any(String, { type: Number, min: 1, max: 3 }, { type: 'integer', min: 5, max: 10 })
      };
      const fieldValidators = validatorBuilder(fields);

      // valid with these values...
      [
        "", "abc",
        1, 1.5, 2, 2.5, 3,
        5, 6, 7, 8, 9, 10
      ].forEach(value => assert.strictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value)));


      // invalid with these values...
      [
        0.5, 3.1, 7.5, 9.99,
      ].forEach(value => assert.notStrictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value)));

      // invalid with these types...
      [
        true, false, null,
        Infinity, NaN,
        new Date(), {}, [], () => {}, /./
      ].forEach(value => assert.strictEqual(fieldValidators.foo(value), 'invalidType', 'Failed validation : ' + JSON.stringify(value)));
    });

    it('should build with given types (implicit)', () => {
      const fields = {
        foo: [String, { type: Number, min: 1, max: 3 }, { type: 'integer', min: 5, max: 10 }]
      };
      const fieldValidators = validatorBuilder(fields);

      // valid with these values...
      [
        "", "abc",
        1, 1.5, 2, 2.5, 3,
        5, 6, 7, 8, 9, 10
      ].forEach(value => assert.strictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value)));


      // invalid with these values...
      [
        0.5, 3.1, 7.5, 9.99,
      ].forEach(value => assert.notStrictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value)));

      // invalid with these types...
      [
        true, false, null,
        Infinity, NaN,
        new Date(), {}, [], () => {}, /./
      ].forEach(value => assert.strictEqual(fieldValidators.foo(value), 'invalidType', 'Failed validation : ' + JSON.stringify(value)));
    });

  });




  describe('Testing arrays', () => {

    it('should build with arrays (shorthand)', () => {
      const fields = {
        foo: [String]
      };
      const fieldValidators = validatorBuilder(fields);

      // valid with these values...
      [
        [], [""], ["abc"], ["", "abc"]
      ].forEach(value => assert.strictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value)));

      // invalid with these types...
      [
        true, false, null, "", "abc",
        Infinity, NaN,
        new Date(), {}, () => {}, /./, [null], [123, ""]
      ].forEach(value => assert.strictEqual(fieldValidators.foo(value), 'invalidType', 'Failed validation : ' + JSON.stringify(value)));
    });

    it('should build with arrays (shorthand)', () => {
      const fields = {
        foo: []
      };
      const fieldValidators = validatorBuilder(fields);

      // valid with these values...
      [
        [], [""], [123], ["abc"], [123, "abc"]
      ].forEach(value => assert.strictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value)));

      // invalid with these types...
      [
        true, false, null, "", "abc",
        Infinity, NaN,
        new Date(), {}, () => {}, /./
      ].forEach(value => assert.strictEqual(fieldValidators.foo(value), 'invalidType', 'Failed validation : ' + JSON.stringify(value)));
    });

    it('should build with arrays of any', () => {
      const fields = {
        foo: [any()]
      };
      const fieldValidators = validatorBuilder(fields);

      // valid with these values...
      [
        [], [""], [123], ["abc"], [123, "abc"]
      ].forEach(value => {
        assert.strictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value));
      });

      // invalid with these types...
      [
        true, false, null, "", "abc",
        Infinity, NaN,
        new Date(), {}, () => {}, /./
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
      ].forEach(value => assert.strictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value)));

      // invalid with these types...
      [
        true, false, null, "", "abc",
        Infinity, NaN,
        new Date(), {}, () => {}, /./,
        [], [""], ["", "", ""], ["abc", "", "def"]
      ].forEach(value => assert.notStrictEqual(fieldValidators.foo(value), undefined, 'Failed validation : ' + JSON.stringify(value)));
    });


    it('should fail with invalid array type', () => {
      [
        [undefined], [null], [null, null], [NaN], [true], [false], ["invalidType"]
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


    it('should validate array of schema', () => {
      const subFields = new Schema({ bar: Boolean });
      const fields = {
        foo: [subFields]
      };
      const fieldValidators = validatorBuilder(fields);
      const model = subFields.createModel();

      assert.strictEqual(fieldValidators.foo([]), undefined, 'Failed validation : []');

      // valid with these values...
      return Promise.all([
        [model], [model, model]
      ].map(value => fieldValidators.foo(value))).then(results => {
        results.forEach(result => assert.strictEqual(result, undefined, 'Failed validation : ' + JSON.stringify(result)));

        // invalid with these types...
        [
          true, false, null, "", "abc",
          Infinity, NaN,
          new Date(), {}, () => {}, /./, [null], [123, ""], [""],
          [model, ""], [model, 123]
        ].forEach(value => assert.strictEqual(fieldValidators.foo(value), 'invalidType', 'Failed validation : ' + JSON.stringify(value)));
      }).then(model.set('bar', 'test')).then(() => fieldValidators.foo([model])).then(result => {
        assert.strictEqual(result, 'invalid@0', 'Failed to mark error at index 0');
      });
    });

  });



  it('should build with schema instances', () => {
    const subFields = new Schema({ bar: Boolean });

    subFields.validate = function (value) {
      return Promise.resolve(value.bar === true ? [] : ['Failed']);
    };

    const fields = {
      foo: subFields
    };
    const fieldValidators = validatorBuilder(fields);
    const goodFoo = subFields.createModel();
    const badFoo = subFields.createModel();
    const invalidFoo = { bar: true };

    return Promise.all([
      goodFoo.set({ bar: true }),
      badFoo.set({ bar: false })
    ]).then(() => {
      return Promise.all([
        fieldValidators.foo(goodFoo),
        fieldValidators.foo(badFoo),
        fieldValidators.foo(invalidFoo)
      ]).then(results => {
        assert.deepStrictEqual(results[0], undefined, 'Failed validation with valid value');
        assert.deepStrictEqual(results[1], 'invalid', 'Failed validation with invalid value');
        assert.deepStrictEqual(results[2], 'invalidType', 'Failed validation with invalid value');
      });
    });
  });


  it('should build schema validator who rejects invalid schema', () => {
    const validSchema = new Schema({ bar: Boolean });
    const invalidSchema = new Schema({ bar: Boolean });

    const fields = {
      foo: validSchema
    };
    const fieldValidators = validatorBuilder(fields);

    const validModel = validSchema.createModel();
    const invalidValues = [
      invalidSchema.createModel(), null, true, false, NaN, {}, [], () => {}, /./, new Date(), "", 0, 1
    ];

    return fieldValidators.foo(validModel).then(message => {
      assert.strictEqual(message, undefined, 'Failed to validate valid schema');
    }).then(() => {
      return Promise.all(invalidValues.map(invalid => fieldValidators.foo(invalid))).then(results => {
        results.forEach((result, index) => {
          assert.strictEqual(result, 'invalidType', 'Failed to validate invalid schema value : ' + JSON.stringify(invalidValues[index]));
        });
      })
    }).then(() => {
      assert.strictEqual(fieldValidators.foo(undefined), undefined, 'Failed with undefined value');
    });
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




  describe('Testing custom validation', () => {

    it('should build custom field validation', () => {
      const fields = {
        foo: {
          type: String,
          custom(value) {
            return (typeof value !== 'string') || (value === 'bar') || 'invalid';
          }
        }
      };
      const fieldValidators = validatorBuilder(fields);

      assert.strictEqual(fieldValidators.foo('bar'), undefined, 'Failed custom valid value');
      assert.strictEqual(fieldValidators.foo('err'), 'invalid', 'Failed custom invalid value');
      assert.strictEqual(fieldValidators.foo(123), 'invalidType', 'Failed custom invalid type');
    });


    it('should build custom asynchronous validation', () => {
      const fields = {
        foo: {
          type: String,
          custom(value) {
            return Promise.resolve().then(() => (typeof value !== 'string') || (value === 'bar') || 'invalid');
          }
        }
      };
      const fieldValidators = validatorBuilder(fields);

      return Promise.all([
        // async validation
        fieldValidators.foo('bar').then(result => {
          assert.strictEqual(result, undefined, 'Failed custom async valid value');
        }),
        fieldValidators.foo('err').then(result => {
          assert.strictEqual(result, 'invalid', 'Failed custom async invalid value');
        })
      ]).then(() => {
        // sync validation
        assert.strictEqual(fieldValidators.foo(123), 'invalidType', 'Failed custom async invalid type');
      });
    });


    it('should validate asynchronously', () => {
      const subSchema = new Schema({ bar: Boolean });
      const fields = {
        foo: {
          type: subSchema,
          test: true,
          custom(value) {
            return this.test === true && value._data['bar'] === true || 'Failed';
          }
        }
      };
      const fieldValidators = validatorBuilder(fields);
      const validFoo = subSchema.createModel();
      const invalidFoo = subSchema.createModel();

      validFoo._data['bar'] = true;
      invalidFoo._data['bar'] = false;

      return Promise.all([
        fieldValidators.foo(true),
        fieldValidators.foo(validFoo),
        fieldValidators.foo(invalidFoo),

      ]).then(messages => {
        assert.strictEqual(messages[0], 'invalidType', 'Failed to validate invalid type');
        assert.strictEqual(messages[1], undefined, 'Failed to validate valid value');
        assert.strictEqual(messages[2], 'Failed', 'Failed return custom error');
      });
    });

  });


});
