import assert from 'assert';
import primitives from '../../src/types/primitives';

import ArrayType from '../../src/types/primitives/array';
import BooleanType from '../../src/types/primitives/boolean';
import DateType from '../../src/types/primitives/date';
import NumberType from '../../src/types/primitives/number';
import ObjectType from '../../src/types/primitives/object';
import StringType from '../../src/types/primitives/string';


describe('Testing primitive map', () => {

  it('should have all primitive types', () => {
    assert.ok( Array in primitives );
    assert.ok( Boolean in primitives );
    assert.ok( Date in primitives );
    assert.ok( Number in primitives );
    assert.ok( Object in primitives );
    assert.ok( String in primitives );
  });


  it('should properly map their respective types', () => {
    assert.ok( primitives[Array] === ArrayType );
    assert.ok( primitives[Boolean] === BooleanType );
    assert.ok( primitives[Date] === DateType );
    assert.ok( primitives[Number] === NumberType );
    assert.ok( primitives[Object] === ObjectType );
    assert.ok( primitives[String] === StringType );
  });


  it('should not allow adding or removing primitives', () => {
    assert.throws(() => delete primitives[Number]);
    assert.throws(() => primitives['test'] = null);
  });

});
