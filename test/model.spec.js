import assert from 'assert';
import { createModel } from '../src/model';


describe('Testing Models', () => {

  it('should create empty model with no defaults', () => {
    const schema = {
      fields: {
        foo: {}
      },
      fieldNames: [ 'foo' ]
    };
    const expected = {};
    const model = createModel(schema);

    assert.deepEqual( model, expected );
  });

  it('should create from properties', () => {
    const schema = {
      fields: {
        foo: {},
        bar: { defaultValue: 'test123' },
        buz: { defaultValue() { return 'value from function' } }
      },
      fieldNames: [ 'foo', 'bar', 'buz' ]
    };
    const expected = { bar: 'test123', buz: 'value from function' };
    const model = createModel(schema);

    assert.deepEqual( model, expected );
  });

  it('should create from default data', () => {
    const schema = {
      fields: {
        foo: {},
        bar: { defaultValue: 'test' }
      },
      fieldNames: [ 'foo', 'bar' ]
    };
    const modelA = createModel(schema, {
      foo: 'hello'
    });
    const modelB = createModel(schema, {
      bar: 'world'
    });
    const modelC = createModel(schema, {
      foo: 'hello',
      bar: 'world'
    });

    assert.deepEqual( modelA, { foo: 'hello', bar: 'test' } );
    assert.deepEqual( modelB, { bar: 'world' } );
    assert.deepEqual( modelC, { foo: 'hello', bar: 'world' } );
  });

});
