
describe('Testing any type', () => {
  const assert = require('assert');

  const any = require('../src/any');

  it('should return "any" with no arguments', () => {
    const type = any();

    assert.strictEqual(type.$any, true, 'Failed');
    assert.strictEqual(type.length, 0, 'Not an array');
  });

  it('should return "any" with arguments', () => {
    const type = any(String, Boolean);

    assert.strictEqual(type.$any, true, 'Failed');
    assert.strictEqual(type.length, 2, 'Not an array');
    assert.strictEqual(type[0], String, 'Invalid type at index 0');
    assert.strictEqual(type[1], Boolean, 'Invalid type at index 1');
  });

});
