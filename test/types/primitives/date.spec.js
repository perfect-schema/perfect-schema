import assert from 'assert';
import DateType from '../../../src/types/primitives/date';


describe('Testing Date primitive type', () => {

  it('should be valid', () => {
    assert.strictEqual( typeof DateType.$$type, 'symbol', 'Date type does not declare a Symbol' );
    assert.strictEqual( typeof DateType.validatorFactory, 'function', 'Date type does not declare a validator factory function');
  });


  describe('Testing validation', () => {

    const validator = DateType.validatorFactory();

    it('should validate undefined', () => {
      assert.strictEqual( validator(undefined), undefined );
    });


    it('should validate null', () => {
      assert.strictEqual( validator(null), undefined );
    });


    it('should validate date', () => {
      assert.strictEqual( validator(new Date()), undefined );
    });


    it('should fail with invalid date', () => {
      assert.strictEqual( validator(new Date('test')), 'invalidDate' );
    });


    it('should fail with anything but dates', () => {
      [
        -1, 0, 1, "", "hello",
        [], () => {}, /./,
        {}, Object.create(null), true, false
      ].forEach(value => assert.strictEqual( validator(value), 'invalidType' ));
    });

  });


  it('should be chainable', () => {
    const value = new Date();
    const validator = DateType.validatorFactory(null, null, null, function (nextValue) {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });

});
