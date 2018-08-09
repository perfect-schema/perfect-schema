import assert from 'assert';
import NumberType from '../../../src/types/primitives/number';


describe('Testing Number primitive type', () => {

  it('should be valid', () => {
    assert.strictEqual( typeof NumberType.$$type, 'symbol', 'Number type does not declare a Symbol' );
    assert.strictEqual( typeof NumberType.validatorFactory, 'function', 'Number type does not declare a validator factory function');
  });


  describe('Testing validation', () => {

    const validator = NumberType.validatorFactory();

    it('should validate undefined', () => {
      assert.strictEqual( validator(undefined), undefined );
    });


    it('should validate null', () => {
      assert.strictEqual( validator(null), undefined );
    });


    it('should validate number', () => {
      assert.strictEqual( validator(-1/3), undefined );
      assert.strictEqual( validator(-45), undefined );
      assert.strictEqual( validator(0), undefined );
      assert.strictEqual( validator(12), undefined );
      assert.strictEqual( validator(123.456), undefined );
    });


    it('should fail with anything but numbers', () => {
      [
        "", "123",
        [], () => {}, /./, new Date(),
        {}, Object.create(null), true, false
      ].forEach(value => assert.strictEqual( validator(value), 'invalidType'));
    });

  });


  it('should be chainable', () => {
    const value = 123;
    const validator = NumberType.validatorFactory(null, null, null, function (nextValue) {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });

});
