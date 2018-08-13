import assert from 'assert';
import ValidationContext from '../src/context';


describe('Testing Validation Context', () => {

  function mockType(name, passthrough) {
    return {
      type: { $$type: Symbol(name) },
      validator: value => !passthrough && (value !== name) ? 'testError' : undefined
    };
  }


  it('should create instance', () => {
    const context = new ValidationContext({
      fields: {},
      fieldNames: [],
      options: {}
    });

    assert.strictEqual(typeof context.schema, 'object');
  });


  it('should validate primitive fields', async () => {
    const context = new ValidationContext({
      fields: {
        foo: mockType('test')
      },
      fieldNames: ['foo'],
      options: {}
    });

    await context.validate({ foo: 'test' });
    assert.deepStrictEqual(context.getMessages(), {});
    assert.strictEqual(context.isValid(), true);

    await context.validate({ foo: 123 });
    assert.deepStrictEqual(context.getMessages(), { foo: 'testError' });
    assert.strictEqual(context.getMessage('foo'), 'testError');
    assert.strictEqual(context.isValid(), false);
  });


  it('should reset not in schema errors', async () => {
    const context = new ValidationContext({
      fields: {
        foo: mockType('test')
      },
      fieldNames: ['foo'],
      options: {}
    });

    await context.validate({ foo: 'wrong', bar: 'other' });
    assert.deepStrictEqual(context.getMessages(), { foo: 'testError', bar: 'notInSchema' });
    await context.validate({ foo: 'test' });
    assert.deepStrictEqual(context.getMessages(), {});
  });


  it('should invalidate missing fields', async () => {
    const context = new ValidationContext({
      fields: {
        foo: mockType('test', true)
      },
      fieldNames: ['foo'],
      options: {}
    });

    await context.validate({ bar: true });
    assert.deepStrictEqual(context.getMessages(), { bar: 'notInSchema' });
    assert.strictEqual(context.isValid(), false);

    await context.validate({ foo: 'test' });
    assert.deepStrictEqual(context.getMessages(), {});
    assert.strictEqual(context.isValid(), true);
  });


  it('should set messages for field', () => {
    const context = new ValidationContext({
      fields: {
        foo: mockType('test', true)
      },
      fieldNames: ['foo'],
      options: {}
    });
    const message = 'test message';

    assert.ok( context.isValid() );

    context.setMessage('foo', message);

    assert.ok( !context.isValid() );
    assert.deepStrictEqual(context.getMessages(), { foo: message });

    context.setMessage('foo');
    assert.ok( context.isValid() );
    assert.deepStrictEqual(context.getMessages(), {});
  });


  it('should reset error messages', () => {
    const context = new ValidationContext({
      fields: {
        foo: mockType('test', true)
      },
      fieldNames: ['foo'],
      options: {}
    });
    const message = 'test message';

    assert.ok( context.isValid() );

    context.setMessage('foo', message);

    assert.ok( !context.isValid() );
    assert.deepStrictEqual(context.getMessages(), { foo: message });

    context.reset();
    assert.ok( context.isValid() );
    assert.deepStrictEqual(context.getMessages(), {});
  });


  it('should fail with invalid field', () => {
    const context = new ValidationContext({
      fields: {
        foo: mockType('test', true)
      },
      fieldNames: ['foo'],
      options: {}
    });

    assert.throws(() => context.setMessage('bar', 'test'));

    [
      undefined, null, NaN,
      -1, 0, 1, true, false, [], {}, /./, ()=>{}, new Date()
    ].forEach(field => assert.throws(() => context.setMessage(field, 'test')) );
  });


  it('should fail with invalid message', () => {
    const context = new ValidationContext({
      fields: {
        foo: mockType('test', true)
      },
      fieldNames: ['foo'],
      options: {}
    });

    [
      -1, 1, true, [], {}, /./, ()=>{}, new Date()
    ].forEach(message => assert.throws(() => context.setMessage('foo', message)) );
  });


});
