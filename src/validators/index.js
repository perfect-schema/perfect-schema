import isOptional from './optional';
import stringValidator from './string';


const typesMap = {
  [String]: stringValidator,
  'string': stringValidator
};


function isType(type) {
  return type in typesMap;
}


export default typesMap;
export { isType, isOptional };
