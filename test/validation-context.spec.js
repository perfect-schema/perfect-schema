

describe('Testing Validation Context', () => {
  const assert = require('assert');

  const validationContext = require('../src/validation-context');


  it('should create new contexts', () => {
    const context1 = validationContext();
    const context2 = validationContext();

    assert.ok(context1, 'Failed first context');
    assert.ok(context2, 'Failed second context');
    assert.notDeepStrictEqual(context1, context2, 'Failed to return different contexts');
  });

  it('should get field value', () => {
    const data = { foo: 'hello' };
    const context = validationContext(data);

    assert.strictEqual(context.field('foo').exists, true, 'Failed to fetch field');
    assert.strictEqual(context.field('foo').value, 'hello', 'Failed to fetch field value');
  });

  it('should get field recursively', () => {
    const data = { foo: { bar: { buz: 'world' } } };
    const context = validationContext(data);

    assert.strictEqual(context.field('foo.bar.buz').exists, true, 'Failed to fetch field');
    assert.strictEqual(context.field('foo.bar.buz').value, 'world', 'Failed to fetch field value');
  });

  it('should get undefined field', () => {
    const data = { foo: 'hello' };
    const context = validationContext(data);

    assert.strictEqual(context.field('bar').exists, false, 'Failed to fetch field');
    assert.strictEqual(context.field('bar').value, undefined, 'Failed to fetch field value');
  });

  it('should get undefined field recursively', () => {
    const data = { foo: { bar: { buz: 'world' } } };
    const context = validationContext(data);

    assert.strictEqual(context.field('foo.foo.buz').exists, false, 'Failed to fetch field');
    assert.strictEqual(context.field('foo.foo.buz').value, undefined, 'Failed to fetch field value');
  });

  it('should get parent context', () => {
    const data = { foo: { bar: { buz: 'world' } } };
    const context1 = validationContext(data);
    const context2 = context1.newContext('foo');

    assert.strictEqual(context1.field('foo').value, data.foo, 'Failed to get field');
    assert.strictEqual(context1.field('bar').exists, false, 'Failed to get invalid field');
    assert.strictEqual(context2.parent().field('foo').value, data.foo, 'Failed to get field from parent');
    assert.strictEqual(context2.field('bar').exists, true, 'Failed to get field');
  });

});
