import assert from 'assert';
import ValidationContext from '../src/context';


describe('Testing Validation Context', () => {

  function mockType(name, passthrough) {
    return {
      type: { $$type: Symbol(name) },
      validator: value => !passthrough && (value !== name) ? 'testError' : undefined
    };
  }

  function mockTypeValidator(name, validator) {
    return {
      type: { $$type: Symbol(name) },
      validator: validator
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


  it('should validate primitive fields', () => {
    const context = new ValidationContext({
      fields: {
        foo: mockType('test')
      },
      fieldNames: ['foo'],
      options: {}
    });

    context.validate({ foo: 'test' });
    assert.strictEqual(context.isValid(), true);
    assert.deepStrictEqual(context.getMessages(), {});

    context.validate({ foo: 123 });
    assert.strictEqual(context.isValid(), false);
    assert.deepStrictEqual(context.getMessages(), { foo: 'testError' });
    assert.strictEqual(context.getMessage('foo'), 'testError');
  });


  it('should reset not in schema errors', () => {
    const context = new ValidationContext({
      fields: {
        foo: mockType('test')
      },
      fieldNames: ['foo'],
      options: {}
    });

    context.validate({ foo: 'wrong', bar: 'other' });
    assert.deepStrictEqual(context.getMessages(), { foo: 'testError', bar: 'notInSchema' });
    context.validate({ foo: 'test' });
    assert.deepStrictEqual(context.getMessages(), {});
  });


  it('should invalidate missing fields', () => {
    const context = new ValidationContext({
      fields: {
        foo: mockType('test', true)
      },
      fieldNames: ['foo'],
      options: {}
    });

    context.validate({ bar: true });
    assert.deepStrictEqual(context.getMessages(), { bar: 'notInSchema' });
    assert.strictEqual(context.isValid(), false);

    context.validate({ foo: 'test' });
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


  it('should fail with invalid data', () => {
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
      -1, 0, 1, true, false
    ].forEach(data => assert.throws(() => context.validate(data)) );
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


  it('should validate partial model', () => {
    const context = new ValidationContext({
      fields: {
        foo: mockType('foo'),
        bar: mockType('bar')
      },
      fieldNames: ['foo', 'bar'],
      options: {}
    });

    context.validate({ foo: 'foo', invalid: false }, { fields: [ 'foo' ]});
    assert.strictEqual(context.isValid(), true);
    assert.deepStrictEqual(context.getMessages(), {});

    // should find notInSchema
    context.validate({ foo: 'foo', invalid: false });
    assert.strictEqual(context.isValid(), false);
    assert.deepStrictEqual(context.getMessages(), { bar: 'testError', invalid: 'notInSchema' });

    // reset notInSchema
    context.validate({ foo: 'foo', invalid: false }, { fields: [ 'foo' ]});
    assert.strictEqual(context.isValid(), false);
    assert.deepStrictEqual(context.getMessages(), { bar: 'testError' });

    context.validate({ bar: 'bar' }, { fields: [ 'bar' ]});
    assert.strictEqual(context.isValid(), true);
    assert.deepStrictEqual(context.getMessages(), {});

    context.validate({}, { fields: []});
    assert.strictEqual(context.isValid(), true);
    assert.deepStrictEqual(context.getMessages(), {});

    context.validate({});
    assert.strictEqual(context.isValid(), false);
    assert.deepStrictEqual(context.getMessages(), { foo: 'testError', bar: 'testError' });
  });


  it('should retrieve model data from validator', () => {
    const context = new ValidationContext({
      fields: {
        foo: mockTypeValidator('foo', (value, self, ctx) => {
          const barField = self.getField('bar');
          const buzField = self.getField('buz');
          const deepField = self.getField('path.to.field');
          const missingField = self.getField('path.to.missing.field');

          assert.strictEqual(self.fieldName, 'foo');
          assert.strictEqual(self.options, true);

          assert.strictEqual(value, 'hello');

          assert.strictEqual(barField.exists, true);
          assert.strictEqual(barField.value, 'world');

          assert.strictEqual(buzField.exists, false);
          assert.strictEqual(buzField.value, undefined);

          assert.strictEqual(deepField.exists, true);
          assert.strictEqual(deepField.value, 'ok');

          assert.strictEqual(missingField.exists, false);
          assert.strictEqual(missingField.value, undefined);

          // @deprecated
          assert.deepStrictEqual(self.getSibling('bar'), self.getField('bar'));

          assert.throws(() => self.getField());

          assert.strictEqual(ctx, context);

          return 'validated';
        }),
        bar: mockType('bar')
      },
      fieldNames: ['foo', 'bar'],
      options: {}
    });

    context.validate({ foo: 'hello', bar: 'world', path: { to: { field: 'ok' } } }, { validatorOptions: true });
    assert.strictEqual(context.isValid(), false);
    assert.deepStrictEqual(context.getMessage('foo'), 'validated');
  });

});
