import assert from 'assert';

import types from '../../src/types/types';

import ArrayType from '../../src/types/primitives/array';
import BooleanType from '../../src/types/primitives/boolean';
import DateType from '../../src/types/primitives/date';
import NumberType from '../../src/types/primitives/number';
import ObjectType from '../../src/types/primitives/object';
import StringType from '../../src/types/primitives/string';

import AnyType from '../../src/types/any';


describe('Testing type registry map', () => {

  it('should have all primitive types', () => {
    assert.ok( types.isPrimitive(Array) );
    assert.ok( types.isPrimitive(Boolean) );
    assert.ok( types.isPrimitive(Date) );
    assert.ok( types.isPrimitive(Number) );
    assert.ok( types.isPrimitive(Object) );
    assert.ok( types.isPrimitive(String) );
  });


  it('should properly map their respective types', () => {
    assert.ok( types.getType(Array) === ArrayType );
    assert.ok( types.getType(Boolean) === BooleanType );
    assert.ok( types.getType(Date) === DateType );
    assert.ok( types.getType(Number) === NumberType );
    assert.ok( types.getType(Object) === ObjectType );
    assert.ok( types.getType(String) === StringType );
  });


  it('should have built-in types', () => {
    assert.ok( types.getType(AnyType) );
  });


  it('should get user type identity', () => {
    const type = {
      $$type: 'test',
      validatorFactory: () => {}
    };

    assert.ok( types.isUserType(type) );
    assert.ok( types.getType(type) === type );
  });


  it('should fail with unknown type', () => {
    [
      undefined, null, false, true, -1, 0, 1,
      {}, [],
      { $$type: 'test' },
      { validatorFactory: () => {} }
    ].forEach(type => assert.ok( types.getType(type) === undefined ));

  });

});
