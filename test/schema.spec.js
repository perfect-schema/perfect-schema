import assert from 'assert';
import Schema from '../src/schema';


describe('Testing Schema', () => {

  it('should create instance', () => {
    const schema = new Schema({
      foo: String
    });

  });

  it('should fail with invalid field name', () => {
    assert.throws(() => new Schema({ '123': String}));
  });


});
