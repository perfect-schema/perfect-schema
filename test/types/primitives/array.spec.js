import assert from 'assert';
import ArrayType from '../../../src/types/primitives/array';


describe('Testing Array primitive type', () => {

  it('should be valid', () => {
    assert.strictEqual( typeof ArrayType.$$type, 'symbol', 'Array type does not declare a Symbol' );
    assert.strictEqual( typeof ArrayType.validatorFactory, 'function', 'Array type does not declare a validator factory function');
  });


  it('should be chainable', () => {
    const value = [];
    const validator = ArrayType.validatorFactory(null, {}, null, nextValue => {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });


  describe('Testing validation', () => {

    const validator = ArrayType.validatorFactory(null, {});

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


  describe('Testing options', () => {

    it('should be required', () => {
      const validator = ArrayType.validatorFactory(null, {
        required: true
      });

      assert.strictEqual( validator(), 'required' );
      assert.strictEqual( validator(undefined), 'required' );
      assert.strictEqual( validator(null), undefined );
      assert.strictEqual( validator([]), undefined );
    });


    it('should not be nullable', () => {
      const validator = ArrayType.validatorFactory(null, {
        nullable: false
      });

      assert.strictEqual( validator(null), 'isNull' );
      assert.strictEqual( validator([]), undefined );
    });


    it('should validate minCount', () => {
      const validator = ArrayType.validatorFactory(null, {
        minCount: 3
      });

      [
        [1, 2, 3], [1, 2, 3, 4]
      ].forEach(value => assert.strictEqual( validator(value), undefined ));

      [
        [], [1], [1, 2]
      ].forEach(value => assert.strictEqual( validator(value), 'minCount' ));
    });


    it('should validate maxCount', () => {
      const validator = ArrayType.validatorFactory(null, {
        maxCount: 3
      });

      [
        [], [1], [1, 2], [1, 2, 3]
      ].forEach(value => assert.strictEqual( validator(value), undefined ));

      [
        [1, 2, 3, 4], [1, 2, 3, 4, 5]
      ].forEach(value => assert.strictEqual( validator(value), 'maxCount' ));
    });

  });

});
