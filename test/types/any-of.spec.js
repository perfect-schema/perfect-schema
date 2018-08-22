import assert from 'assert';
import AnyOfType from '../../src/types/any-of';


describe('Testing Any type', () => {

  it('should be valid', () => {
    const CustomType = AnyOfType(String);

    assert.strictEqual( typeof CustomType.$$type, 'symbol', 'AnyOf type does not declare a Symbol' );
    assert.strictEqual( typeof CustomType.validatorFactory, 'function', 'AnyOf type does not declare a validator factory function');
  });


  it('should have type equality', () => {
    const a = AnyOfType(String);
    const b = AnyOfType(String);

    assert.strictEqual( a.$$type, b.$$type );
  });


  it('should fail with invalid type', () => {
    assert.throws(() => AnyOfType());

    [
      undefined, null, NaN,
      -1, 0, 1, "", [], {}
    ].forEach(type => assert.throws(() => AnyOfType(type)));
  });


  it('should be chainable', () => {
    const value = 'hello';
    const validator = AnyOfType(String, Number).validatorFactory(null, {}, null, function (nextValue) {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });


  describe('Testing validation with primitive', () => {

    const validator = AnyOfType(String, Date).validatorFactory(null, {});

    it('should validate undefined', () => {
      assert.strictEqual( validator(undefined), undefined );
    });


    it('should validate null', () => {
      assert.strictEqual( validator(null), undefined );
    });


    it('should validate strings and Date instances', () => {
      assert.strictEqual( validator('test'), undefined );
      assert.strictEqual( validator(new Date()), undefined );
    });

    return;
    it('should fail with anything but strings and dates', () => {
      [
        -1, 0, 1,
        () => {}, /./, new Date('invalid date'), new Array(),
        [], {}, Object.create(null), false, true
      ].forEach(value => assert.strictEqual( validator(value), 'invalidType' ));
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

    const validator = AnyOfType(Number, schema).validatorFactory('foo', {});

    it('should validate with custom type', () => {
      assert.strictEqual( validator('test'), undefined );
      assert.strictEqual( validator(0), undefined );
    });

    it('should fail with invalid value data', () => {

      // Note: here, the message is 'invalidType' because Number comes first.
      // if the schema had been first, the message would have been 'error'
      assert.strictEqual( validator({}), 'invalidType' );
    });

  });


  describe('Testing options', () => {

    it('should be required', () => {
      const validator = AnyOfType(String, Number).validatorFactory(null, {
        required: true
      });

      assert.strictEqual( validator(), 'required' );
      assert.strictEqual( validator(undefined), 'required' );
      assert.strictEqual( validator(null), undefined );
      assert.strictEqual( validator('test'), undefined );
      assert.strictEqual( validator(123), undefined );
    });


    it('should not be nullable', () => {
      const validator = AnyOfType(String, Number).validatorFactory(null, {
        nullable: false
      });

      assert.strictEqual( validator(null), 'isNull' );
      assert.strictEqual( validator('test'), undefined );
      assert.strictEqual( validator(123), undefined );
    });

  });

});
