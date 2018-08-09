import ArrayType from './primitives/array';
import BooleanType from './primitives/boolean';
import DateType from './primitives/date';
import NumberType from './primitives/number';
import ObjectType from './primitives/object';
import StringType from './primitives/string';

export default Object.freeze({
  [Array]: ArrayType,
  [Boolean]: BooleanType,
  [Date]: DateType,
  [Number]: NumberType,
  [Object]: ObjectType,
  [String]: StringType
});
