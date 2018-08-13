import assert from 'assert';
import AnyType from '../../src/types/any';


describe('Testing Any type', () => {

  it('should be valid', () => {
    assert.strictEqual( typeof AnyType.$$type, 'symbol', 'Any type does not declare a Symbol' );
    assert.strictEqual( typeof AnyType.validatorFactory, 'function', 'Any type does not declare a validator factory function');
  });


  it('should be chainable', () => {
    const value = 'hello';
    const validator = AnyType.validatorFactory(null, null, null, function (nextValue) {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });


  describe('Testing validation', () => {

    const validator = AnyType.validatorFactory();

    it('should validate undefined', () => {
      assert.strictEqual( validator(undefined), undefined );
    });


    it('should validate null', () => {
      assert.strictEqual( validator(null), undefined );
    });


    it('should validate anything', () => {
      [
        "", "123",
        -1, 0, 1,
        [], () => {}, /./, new Date(),
        {}, Object.create(null), true, false
      ].forEach(value => assert.strictEqual( validator(value), undefined ));
    });

  });

});
