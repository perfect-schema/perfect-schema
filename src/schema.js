import varValidator from 'var-validator';


export default class PerfectSchema {


  constructor(fields, options = {}) {
    if (!fields) {
      throw new TypeError('No defined fields');
    }

    validateFields(fields);


    this._fields = fields;
  }


  createContext() {

  }


  createModel() {

  }

}



function validateFields(fields) {
  for (let field in fields) {
    if (!varValidator.isValid(field)) {
      throw new Error('Invalid field name : ' + field);
    }
  }
}
