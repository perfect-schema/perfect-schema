

describe('Testing Model', () => {
  const assert = require('assert');

  const Model = require('../src/model');


  function PerfectSchema() {
    this._options = {};
    this.validate = function () {};
  }



  it('should create new model', () => {
    const Foo = new Model(new PerfectSchema());

  });


});
