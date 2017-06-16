
describe('Date validation', () => {
  const assert = require('assert');

  const dateValidator = require('../../src/types/date');

  const field = 'test';

  it('should validate if undefined', () => {
    const validator = dateValidator(field, {});

    assert.strictEqual(validator(undefined), undefined, 'Failed at validating undefined');
  });

  it('should validate valid type', () => {
    const validator = dateValidator(field, {});

    [
      new Date()
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating valid type : ' + JSON.stringify(value)));
  });

  it('should validate invalid type', () => {
    const validator = dateValidator(field, {});

    [
      new Date('invalid'),
      true, false, null, "", "abc",
      -1, 0, 1, Infinity, NaN,
      [], {}, () => {}, /./
    ].forEach(value => assert.strictEqual(validator(value), 'invalidType', 'Failed at validating invalid type : ' + JSON.stringify(value)));
  });

  it('should validate min date', () => {
    const validator = dateValidator(field, { min: new Date('2000-01-01 0:00:00.000') });

    [
      new Date('2000-01-01 0:00:00'), new Date('2000-01-01 0:00:00.0001'), new Date('2020-06-30')
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating min date : ' + JSON.stringify(value)));

    [
      new Date('1999-12-31 23:59:59.9999'), new Date('1999-12-31'), new Date('1980-01-01')
    ].forEach(value => assert.strictEqual(validator(value), 'minDate', 'Failed at validating min date : ' + JSON.stringify(value)));
  });

  it('should validate max date', () => {
    const validator = dateValidator(field, { max: new Date('2000-01-01 0:00:00.000') });

    [
      new Date('2000-01-01 0:00:00.000'), new Date('1999-12-31 23:59:59.999'), new Date('1980-01-01')
    ].forEach(value => assert.strictEqual(validator(value), undefined, 'Failed at validating max date : ' + JSON.stringify(value)));

    [
      new Date('2000-01-01 0:00:00.001'), new Date('2000-01-02'), new Date('2020-06-30')
    ].forEach(value => assert.strictEqual(validator(value), 'maxDate', 'Failed at validating max date : ' + JSON.stringify(value)));
  });

});
