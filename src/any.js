/**
Return a specification where a field can be any of these types.
If no arguments are provided, literally the field will never
be invalid, as long as they are optional.

@return {Array}
*/
module.exports = function any() {
  const types = Array.prototype.slice.call(arguments);

  types.$any = true;

  return types;
};
