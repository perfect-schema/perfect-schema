import ArrayType from './primitives/array';
import BooleanType from './primitives/boolean';
import DateType from './primitives/date';
import NumberType from './primitives/number';
import ObjectType from './primitives/object';
import StringType from './primitives/string';

import AnyType from './any';
import AnyOfType from './any-of';
import ArrayOfType from './array-of';


const primitiveTypes = {
  [Array]: ArrayType,
  [Boolean]: BooleanType,
  [Date]: DateType,
  [Number]: NumberType,
  [Object]: ObjectType,
  [String]: StringType
};


export default Object.freeze({

  /**
  Return the type for the given key. If key is a type, it is returned.

  @param type {String|type}
  @return {type}
  */
  getType(type) {
    if (this.isPrimitive(type)) {
      return primitiveTypes[type];
    } else if (this.isType(type)) {
      return type;
    } else {
      return undefined;
    }
  },

  /**
  Check if type is actually a type

  @param type {mixed}
  @return {Boolean}
  */
  isPrimitive(type) {
    return type && !Array.isArray(type) && (type in primitiveTypes);
  },

  /**
  Check if type is actually a type

  @param type {mixed}
  @return {Boolean}
  */
  isType(type) {
    return type && type.$$type && (typeof type.validatorFactory === 'function') && !Array.isArray(type.$$type) || false;
  },

  isUserType(type) {
    console.warn("Deprecated! Use isType() instead!");
    return this.isType(type);
  }

});


export { AnyType, AnyOfType, ArrayOfType };
