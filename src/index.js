import validatorBuilder from './validator-builder';
import any from './any';


class PerfectSchema {

  constructor(fields) {
    if (typeof fields !== 'object') { throw new TypeError('Fields must be an object'); }

    this._fieldNames = Object.keys(fields);
    this._fields = fields;
    this._validators = validatorBuilder(fields);
  }

  /**
  Validate the given data

  @param data {Object}    the data to Validate
  @return {ValidationResult}
  */
  validate(data) {
    return null;
  }

}

PerfectSchema.any = any;


export default PerfectSchema;
