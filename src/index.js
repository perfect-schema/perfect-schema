const AnyType = require('./any').Type;
const IntegerType = require('./validators/integer').Type;
const PerfectSchema = require('./schema');
const PerfectModel = require('./model');
const validators = require('./validators');
const types = require('./validators/types');

PerfectSchema.Any = AnyType;
PerfectSchema.Integer = IntegerType;
PerfectSchema.isModel = PerfectModel.isModel;
PerfectSchema.registerValidator = validators.registerValidator;
PerfectSchema.unregisterValidator = validators.unregisterValidator;
PerfectSchema.registerType = types.registerType;
PerfectSchema.unregisterType = types.unregisterType;

module.exports = PerfectSchema;
