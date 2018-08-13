import assert from 'assert';
import ObjectType from '../../../src/types/primitives/object';


describe('Testing Object primitive type', () => {

  it('should be valid', () => {
    assert.strictEqual( typeof ObjectType.$$type, 'symbol', 'Object type does not declare a Symbol' );
    assert.strictEqual( typeof ObjectType.validatorFactory, 'function', 'Object type does not declare a validator factory function');
  });


  it('should be chainable', () => {
    const value = { foo: 'bar' };
    const validator = ObjectType.validatorFactory(null, null, null, nextValue => {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });


  describe('Testing validation', () => {

    const validator = ObjectType.validatorFactory();

    it('should validate undefined', () => {
      assert.strictEqual( validator(undefined), undefined );
    });


    it('should validate null', () => {
      assert.strictEqual( validator(null), undefined );
    });


    it('should validate object', () => {
      assert.strictEqual( validator({}), undefined );
      assert.strictEqual( validator({ foo: 'bar' }), undefined );
      assert.strictEqual( validator(Object.create(Object.prototype, { hello: { value: 'world' } })), undefined );
    });


    it('should fail with anything but POJO', () => {
      [
        -1, 0, 1, '', 'foo',
        [], () => {}, /./, new Date(),
        Object.create(null), true, false
      ].forEach(value => assert.strictEqual( validator(value), 'invalidType' ));
    });

  });

});
