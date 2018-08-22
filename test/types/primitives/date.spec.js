import assert from 'assert';
import DateType from '../../../src/types/primitives/date';


describe('Testing Date primitive type', () => {

  it('should be valid', () => {
    assert.strictEqual( typeof DateType.$$type, 'symbol', 'Date type does not declare a Symbol' );
    assert.strictEqual( typeof DateType.validatorFactory, 'function', 'Date type does not declare a validator factory function');
  });


  it('should be chainable', () => {
    const value = new Date();
    const validator = DateType.validatorFactory(null, {}, null, nextValue => {
      assert.strictEqual( value, nextValue );

      return 'test';
    });

    assert.strictEqual( validator(value), 'test' );
  });


  describe('Testing validation', () => {

    const validator = DateType.validatorFactory(null, {});

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


  describe('Testing options', () => {

    it('should be required', () => {
      const validator = DateType.validatorFactory(null, {
        required: true
      });

      assert.strictEqual( validator(), 'required' );
      assert.strictEqual( validator(undefined), 'required' );
      assert.strictEqual( validator(new Date()), undefined );
    });


    it('should not be nullable', () => {
      const validator = DateType.validatorFactory(null, {
        nullable: false
      });

      assert.strictEqual( validator(null), 'isNull' );
      assert.strictEqual( validator(new Date()), undefined );
    });


    it('should validate min date', () => {
      const validator = DateType.validatorFactory(null, {
        minDate: new Date('2000-01-01')
      });

      assert.strictEqual( validator(new Date('1999-12-31')), 'minDate' );
      assert.strictEqual( validator(new Date('2000-01-02')), undefined );
    });


    it('should validate max date', () => {
      const validator = DateType.validatorFactory(null, {
        maxDate: new Date('2000-01-01')
      });

      assert.strictEqual( validator(new Date('1999-12-31')), undefined );
      assert.strictEqual( validator(new Date('2000-01-02')), 'maxDate' );
    });

  });

});
