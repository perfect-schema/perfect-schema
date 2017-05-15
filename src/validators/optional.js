/**
Check that the given value is not undefined if the provided options
does not have the optional key set to true.

If the value is undefined, returns 'required'. Return undefined otherwise.

@param value {mixed}
@return {undefined|String}
*/
export default function isOptional(value) {
  if (value === undefined) {
    return 'required';
  }
}
