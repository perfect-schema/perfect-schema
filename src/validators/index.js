const stringValidator = require('./string');


module.export = {
  [String]: stringValidator,
  'string': stringValidator
};
