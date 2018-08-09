import assert from 'assert';
import ArrayType from '../../../src/types/primitives/array';


describe('Testing Array primitive type', () => {

  it('should be valid', () => {
    assert.strictEqual( typeof ArrayType.$$type, 'symbol', 'Array type does not declare a Symbol' );
    assert.strictEqual( typeof ArrayType.validatorFactory, 'function', 'Array type does not declare a validator factory function');
  });


  describe('Testing validation', () => {

    const validator = ArrayType.validatorFactory();

    it('should validate undefined', () => {
      assert.strictEqual( validator(undefined), undefined );
    });


    it('should validate null', () => {
      assert.strictEqual( validator(null), undefined );
    });


    it('should validate array', () => {
      assert.strictEqual( validator([]), undefined );
      assert.strictEqual( validator(new Array()), undefined );
    });


    it('should fail with anything but array', () => {
      [
        -1, 0, 1, '', 'foo',
        () => {}, /./, new Date(),
        {}, Object.create(null), false, true
      ].forEach(value => assert.strictEqual( validator(value), 'invalidType' ));
    });

  });


  it('should be chainable', () => {
    const value = [];
    const validator = ArrayType.validatorFactory(null, null, null, function (nextValue) {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });

});
