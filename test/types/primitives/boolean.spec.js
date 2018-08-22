import assert from 'assert';
import BooleanType from '../../../src/types/primitives/boolean';


describe('Testing Boolean primitive type', () => {

  it('should be valid', () => {
    assert.strictEqual( typeof BooleanType.$$type, 'symbol', 'Boolean type does not declare a Symbol' );
    assert.strictEqual( typeof BooleanType.validatorFactory, 'function', 'Boolean type does not declare a validator factory function');
  });


  it('should be chainable', () => {
    const value = false;
    const validator = BooleanType.validatorFactory(null, {}, null, nextValue => {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });


  describe('Testing validation', () => {

    const validator = BooleanType.validatorFactory(null, {});

    it('should validate undefined', () => {
      assert.strictEqual( validator(undefined), undefined );
    });


    it('should validate null', () => {
      assert.strictEqual( validator(null), undefined );
    });


    it('should validate boolean', () => {
      assert.strictEqual( validator(true), undefined );
      assert.strictEqual( validator(false), undefined );
    });


    it('should fail with anything but boolean', () => {
      [
        -1, 0, 1, '', 'foo',
        [], () => {}, /./, new Date(),
        {}, Object.create(null)
      ].forEach(value => assert.strictEqual( validator(value), 'invalidType' ));
    });

  });


  describe('Testing options', () => {

    it('should be required', () => {
      const validator = BooleanType.validatorFactory(null, {
        required: true
      });

      assert.strictEqual( validator(), 'required' );
      assert.strictEqual( validator(undefined), 'required' );
      assert.strictEqual( validator(null), undefined );
      assert.strictEqual( validator(true), undefined );
      assert.strictEqual( validator(false), undefined );
    });


    it('should not be nullable', () => {
      const validator = BooleanType.validatorFactory(null, {
        nullable: false
      });

      assert.strictEqual( validator(null), 'isNull' );
      assert.strictEqual( validator(true), undefined );
      assert.strictEqual( validator(false), undefined );
    });

  });

});
