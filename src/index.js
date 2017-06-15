const any = require('./any');
const IntegerType = require('./validators/integer').Type;
const PerfectSchema = require('./schema');
const PerfectModel = require('./model');
const plugins = require('./validation-plugins');

PerfectSchema.any = any;
PerfectSchema.Integer = IntegerType;
PerfectSchema.isModel = PerfectModel.isModel;
PerfectSchema.registerValidator = plugins.registerPlugin;
PerfectSchema.unregisterValidator = plugins.nregisterPlugin;

module.exports = PerfectSchema;
