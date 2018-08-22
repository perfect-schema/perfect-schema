import assert from 'assert';
import StringType from '../../../src/types/primitives/string';


describe('Testing String primitive type', () => {

  it('should be valid', () => {
    assert.strictEqual( typeof StringType.$$type, 'symbol', 'String type does not declare a Symbol' );
    assert.strictEqual( typeof StringType.validatorFactory, 'function', 'String type does not declare a validator factory function');
  });


  it('should be chainable', () => {
    const value = 'hello';
    const validator = StringType.validatorFactory(null, {}, null, nextValue => {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });


  describe('Testing validation', () => {

    const validator = StringType.validatorFactory(null, {});

    it('should validate undefined', () => {
      assert.strictEqual( validator(undefined), undefined );
    });


    it('should validate null', () => {
      assert.strictEqual( validator(null), undefined );
    });


    it('should validate string', () => {
      assert.strictEqual( validator(""), undefined );
      assert.strictEqual( validator("123"), undefined );
    });


    it('should fail with anything but strings', () => {
      [
        -1, 0, 1,
        [], () => {}, /./, new Date(),
        {}, Object.create(null), true, false
      ].forEach(value => assert.strictEqual( validator(value), 'invalidType' ));
    });

  });


  describe('Testing options', () => {

    it('should be required', () => {
      const validator = StringType.validatorFactory(null, {
        required: true
      });

      assert.strictEqual( validator(), 'required' );
      assert.strictEqual( validator(undefined), 'required' );
      assert.strictEqual( validator(null), undefined );
      assert.strictEqual( validator(''), undefined );
      assert.strictEqual( validator('test'), undefined );
    });


    it('should not be nullable', () => {
      const validator = StringType.validatorFactory(null, {
        nullable: false
      });

      assert.strictEqual( validator(null), 'isNull' );
      assert.strictEqual( validator(''), undefined );
      assert.strictEqual( validator('test'), undefined );
    });


    it('should validate min', () => {
      const validator = StringType.validatorFactory(null, {
        minLength: 3
      });

      [
        '123', '1234', '12345'
      ].forEach(value => assert.strictEqual( validator(value), undefined ));

      [
        '', '1', '12'
      ].forEach(value => assert.strictEqual( validator(value), 'minLength' ));
    });


    it('should validate max', () => {
      const validator = StringType.validatorFactory(null, {
        maxLength: 3
      });

      [
        '', '1', '12', '123'
      ].forEach(value => assert.strictEqual( validator(value), undefined ));

      [
        '1234', '12345'
      ].forEach(value => assert.strictEqual( validator(value), 'maxLength' ));
    });

  });

});
