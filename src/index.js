const AnyType = require('./any').Type;
const IntegerType = require('./validators/integer').Type;
const PerfectSchema = require('./schema');
const PerfectModel = require('./model');
const validators = require('./validators');

PerfectSchema.Any = AnyType;
PerfectSchema.Integer = IntegerType;
PerfectSchema.isModel = PerfectModel.isModel;
PerfectSchema.registerValidator = validators.registerValidator;
PerfectSchema.unregisterValidator = validators.unregisterValidator;

module.exports = PerfectSchema;
