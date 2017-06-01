const any = require('./any');
const IntegerType = require('./validators/integer').Type;
const PerfectSchema = require('./schema');
const PerfectModel = require('./model');

PerfectSchema.any = any;
PerfectSchema.Integer = IntegerType;
PerfectSchema.isModel = PerfectModel.isModel;

module.export = PerfectSchema;
