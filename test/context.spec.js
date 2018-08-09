import assert from 'assert';
import ValidationContext from '../src/context';


describe('Testing Validation Context', () => {

  function mockType(name, passthrough) {
    return {
      type: { $$type: Symbol(name) },
      validator: value => !passthrough && (value !== name) ? 'testError' : undefined
    };
  }

  function mockTypeAsync(name, passthrough, throwError) {
    return {
      type: { $$type: Symbol(name) },
      validator: async value => !passthrough && (value !== name) ? 'testErrorAsync' : undefined
    }
  }

  function mockTypeAsyncError(name, error) {
    return {
      type: { $$type: Symbol(name) },
      validator: async value => { throw new Error(error); }
    }
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
    assert.deepStrictEqual(context.messages, {});
    assert.strictEqual(context.isValid, true);

    await context.validate({ foo: 123 });
    assert.deepStrictEqual(context.messages, { foo: 'testError' });
    assert.strictEqual(context.isValid, false);
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
    assert.deepStrictEqual(context.messages, { foo: 'testError', bar: 'notInSchema' });
    await context.validate({ foo: 'test' });
    assert.deepStrictEqual(context.messages, {});
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
    assert.deepStrictEqual(context.messages, { bar: 'notInSchema' });
    assert.strictEqual(context.isValid, false);

    await context.validate({ foo: 'test' });
    assert.deepStrictEqual(context.messages, {});
    assert.strictEqual(context.isValid, true);
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

    assert.ok( context.isValid );

    context.setMessage('foo', message);

    assert.ok( !context.isValid );
    assert.deepStrictEqual(context.messages, { foo: message });

    context.setMessage('foo');
    assert.ok( context.isValid );
    assert.deepStrictEqual(context.messages, {});
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

    assert.ok( context.isValid );

    context.setMessage('foo', message);

    assert.ok( !context.isValid );
    assert.deepStrictEqual(context.messages, { foo: message });

    context.reset();
    assert.ok( context.isValid );
    assert.deepStrictEqual(context.messages, {});
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


  it('should set parent message', () => {
    const parentContext = new ValidationContext({
      fields: {
        foo: mockType('test', true)
      },
      fieldNames: ['foo'],
      options: {}
    });
    const context = new ValidationContext({
      fields: {
        bar: mockType('test', true)
      },
      fieldNames: ['bar'],
      options: {}
    }, {
      parentContext,
      parentField: 'foo'
    });

    assert.ok( context.isValid );
    assert.ok( parentContext.isValid );

    context.setMessage('bar', 'test');

    assert.ok( !context.isValid );
    assert.ok( !parentContext.isValid );

    assert.deepStrictEqual(context.messages, { bar: 'test' });
    assert.deepStrictEqual(parentContext.messages, { foo: 'invalid' });

    context.setMessage('bar');

    assert.ok( context.isValid );
    assert.ok( parentContext.isValid );

    assert.deepStrictEqual(context.messages, {});
    assert.deepStrictEqual(parentContext.messages, {});
  });


  it('should reset parent message', () => {
    const parentContext = new ValidationContext({
      fields: {
        foo: mockType('test', true)
      },
      fieldNames: ['foo'],
      options: {}
    });
    const context = new ValidationContext({
      fields: {
        bar: mockType('test', true)
      },
      fieldNames: ['bar'],
      options: {}
    }, {
      parentContext,
      parentField: 'foo'
    });

    assert.ok( context.isValid );
    assert.ok( parentContext.isValid );

    context.setMessage('bar', 'test');

    assert.ok( !context.isValid );
    assert.ok( !parentContext.isValid );

    assert.deepStrictEqual(context.messages, { bar: 'test' });
    assert.deepStrictEqual(parentContext.messages, { foo: 'invalid' });

    context.reset();

    assert.ok( context.isValid );
    assert.ok( parentContext.isValid );

    assert.deepStrictEqual(context.messages, {});
    assert.deepStrictEqual(parentContext.messages, {});
  });


  it('should validate asynchronously', async () => {
    const context = new ValidationContext({
      fields: {
        foo: mockTypeAsync('test', true)
      },
      fieldNames: ['foo'],
      options: {}
    });

    await context.validate({ bar: true });
    assert.deepStrictEqual(context.messages, { bar: 'notInSchema' });
    assert.strictEqual(context.isValid, false);

    await context.validate({ foo: 'test' });
    assert.deepStrictEqual(context.messages, {});
    assert.strictEqual(context.isValid, true);
  });


  it('should thrown asynchronously', async () => {
    const context = new ValidationContext({
      fields: {
        foo: mockTypeAsyncError('test', 'errorAsync')
      },
      fieldNames: ['foo'],
      options: {}
    });

    try {
      await context.validate({ foo: 'test' });
    } catch (e) {
      assert.strictEqual( e.message, 'errorAsync' );
    }
  });

});
