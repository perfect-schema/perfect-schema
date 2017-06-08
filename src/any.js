
const ANY_SYMBOL = Object.create(null, {
  toString: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function toString() { return 'any'; }
  }
});

/**
Return a specification where a field can be any of these types.
If no arguments are provided, literally the field will never
be invalid, as long as they are optional.

@return {Array}
*/
function any() {
  const types = Array.prototype.slice.call(arguments);

  Object.defineProperty(types, '$any', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: ANY_SYMBOL
  });

  return types;
};


/**
Test whether the given type is the value returned by any()

@param type {any}
@return boolean
*/
function isAny(type) {
  return type && (type.$any === ANY_SYMBOL) || false;
}


any.isAny = isAny;

module.exports = any;
