import assert from 'assert';
import IntegerType from '../../src/types/integer';


describe('Testing Integer type', () => {

  it('should be valid', () => {
    assert.strictEqual( typeof IntegerType.$$type, 'symbol', 'Integer type does not declare a Symbol' );
    assert.strictEqual( typeof IntegerType.validatorFactory, 'function', 'Integer type does not declare a validator factory function');
  });


  it('should be chainable', () => {
    const value = 123;
    const validator = IntegerType.validatorFactory(null, {}, null, nextValue => {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });


  describe('Testing validation', () => {

    const validator = IntegerType.validatorFactory(null, {});

    it('should validate undefined', () => {
      assert.strictEqual( validator(undefined), undefined );
    });


    it('should validate null', () => {
      assert.strictEqual( validator(null), undefined );
    });


    it('should validate integer', () => {
      assert.strictEqual( validator(-45), undefined );
      assert.strictEqual( validator(0), undefined );
      assert.strictEqual( validator(12), undefined );
    });


    it('should fail with anything but integers', () => {
      [
        -Infinity, -123.456, 0.123, Math.PI, Infinity,
        "", "123", NaN,
        [], () => {}, /./, new Date(),
        {}, Object.create(null), true, false
      ].forEach(value => assert.strictEqual( validator(value), 'invalidType'));
    });

  });


  describe('Testing options', () => {

    it('should be required', () => {
      const validator = IntegerType.validatorFactory(null, {
        required: true
      });

      assert.strictEqual( validator(), 'required' );
      assert.strictEqual( validator(undefined), 'required' );
      assert.strictEqual( validator(null), undefined );
      assert.strictEqual( validator(0), undefined );
      assert.strictEqual( validator(123), undefined );
    });


    it('should not be nullable', () => {
      const validator = IntegerType.validatorFactory(null, {
        nullable: false
      });

      assert.strictEqual( validator(null), 'isNull' );
      assert.strictEqual( validator(0), undefined );
      assert.strictEqual( validator(123), undefined );
    });


    it('should validate min', () => {
      const validator = IntegerType.validatorFactory(null, {
        minNumber: 3
      });

      [
        3, 4, 5
      ].forEach(value => assert.strictEqual( validator(value), undefined ));

      [
        -1, 0, 1, 2
      ].forEach(value => assert.strictEqual( validator(value), 'minNumber' ));
    });


    it('should validate max', () => {
      const validator = IntegerType.validatorFactory(null, {
        maxNumber: 3
      });

      [
        -1, 0, 1, 2, 3
      ].forEach(value => assert.strictEqual( validator(value), undefined ));

      [
        4, 5, 6
      ].forEach(value => assert.strictEqual( validator(value), 'maxNumber' ));
    });

  });

});
