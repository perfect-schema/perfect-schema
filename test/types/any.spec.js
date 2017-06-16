
describe('Testing any type validation', () => {

  const assert = require('assert');

  const any = require('../../src/types/any');

  it('should validate "any" with no arguments', () => {
    const type = any('test', {});

    [
      undefined, null, false, true, NaN, Infinity, [], {},
      () => {}, new Date(), /./, "", "test", -1, 0, 1
    ].forEach(value => assert.strictEqual(type(value), undefined, 'Failed with : ' + JSON.stringify(value)));
  });














  return;


  it('should return "any" with arguments', () => {
    const type = any(String, Boolean);

    assert.strictEqual(any.isAny(type), true, 'Failed');
    assert.strictEqual(type.length, 2, 'Not an array');
    assert.strictEqual(type[0], String, 'Invalid type at index 0');
    assert.strictEqual(type[1], Boolean, 'Invalid type at index 1');
  });

  it('should not be any', () => {
    const type = [];

    type.$any = Object.create(null, {
      toString: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function toString() { return 'any'; }
      }
    });

    assert.strictEqual(any.isAny(type), false, 'Failed');

    [
      undefined, null, false, true, NaN, Infinity, [], {},
      () => {}, new Date(), /./, "", "test", -1, 0, 1
    ].forEach(type => assert.strictEqual(any.isAny(type), false, 'Failed with : ' + JSON.stringify(type)));
  });

});
