import assert from 'assert';
import ArrayOfType from '../../src/types/array-of';


describe('Testing ArrayOf type', () => {

  it('should be valid', () => {
    const CustomType = ArrayOfType(String);

    assert.strictEqual( typeof CustomType.$$type, 'symbol', 'ArrayOf type does not declare a Symbol' );
    assert.strictEqual( typeof CustomType.validatorFactory, 'function', 'ArrayOf type does not declare a validator factory function');
  });


  it('should have type equality', () => {
    const a = ArrayOfType(String);
    const b = ArrayOfType(String);

    assert.strictEqual( a.$$type, b.$$type );
  });


  it('should fail with invalid type', () => {
    assert.throws(() => ArrayOfType());

    [
      undefined, null, NaN,
      -1, 0, 1, "", [], {}
    ].forEach(type => assert.throws(() => ArrayOfType(type)));
  });


  it('should be chainable', () => {
    const value = ['hello'];
    const validator = ArrayOfType(String).validatorFactory(null, {}, null, function (nextValue) {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });


  describe('Testing validation with primitive', () => {

    const validator = ArrayOfType(String).validatorFactory(null, {});

    it('should validate undefined', () => {
      assert.strictEqual( validator(undefined), undefined );
    });


    it('should validate null', () => {
      assert.strictEqual( validator(null), undefined );
    });


    it('should validate array of strings', () => {
      assert.strictEqual( validator(['test']), undefined );
      assert.strictEqual( validator(new Array('test')), undefined );
    });


    it('should fail with anything but array', () => {
      [
        -1, 0, 1, '', 'foo',
        () => {}, /./, new Date(),
        {}, Object.create(null), false, true
      ].forEach(value => assert.strictEqual( validator(value), 'invalidType' ));
    });


    it('should fail with invalid item type', () => {
      [
        -1, 0, 1, [], new Array(),
        () => {}, /./, new Date(),
        {}, Object.create(null), false, true
      ].forEach(value => assert.strictEqual( validator( [value] ), 'invalid' ));
    });

  });


  describe('Testing validation with custom types', () => {
    class PerfectSchema {
      constructor() {
        this._type = {
          $$type: 'test',
          validatorFactory: () => {
            function validator(value) {
              return value !== 'test' ? 'error' : undefined;
            };
            validator.context = {
              getMessages() {
                return { foo: 'contextMessage' };
              },
              setMessage(field, msg) {}
            };

            return validator;
          }
        };
      }
    };
    const schema = new PerfectSchema();

    const validator = ArrayOfType(schema).validatorFactory('foo', {});

    it('should validate with custom type', () => {
      const value = ['test'];

      assert.strictEqual( validator(value), undefined );
    });

    it('should fail with invalid schema data', () => {
      const value = ['some value'];
      const context = {
        setMessage(field, msg) {
          assert.strictEqual(field, 'foo.0.foo');
        },
        validate(validatedValue) {
          assert.strictEqual(value, validatedValue);
        }
      };

      assert.strictEqual( validator(value, null, context), 'invalid' );
    });

  });


  describe('Testing options', () => {

    it('should be required', () => {
      const validator = ArrayOfType(String).validatorFactory(null, {
        required: true
      });

      assert.strictEqual( validator(), 'required' );
      assert.strictEqual( validator(undefined), 'required' );
      assert.strictEqual( validator(null), undefined );
      assert.strictEqual( validator([]), undefined );
      assert.strictEqual( validator(['test']), undefined );
    });


    it('should not be nullable', () => {
      const validator = ArrayOfType(String).validatorFactory(null, {
        nullable: false
      });

      assert.strictEqual( validator(null), 'isNull' );
      assert.strictEqual( validator([]), undefined );
      assert.strictEqual( validator(['test']), undefined );
    });
    
  });

});
