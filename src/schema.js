import ValidationContext from './validation-context';
import { sanitizeFields } from './field-sanitizer';
import { createModel } from './model-defaults';


/**
Global plugin cache
*/
const plugins = [];


export default class PerfectSchema {

  /**
  Add a plugin to use with new instances of PerfectSchema. Added
  plugins do not affect currently instanciated instances.

  @param plugin {Function} a single function receiving the instance
  */
  static use(plugin) {
    plugins.push(plugin);
  }


  /**
  Create a new instance

  @param fields {Object} the fields definition (will be sanitized and normalized)
  @params options {Object} the schema options
  */
  constructor(fields, options = {}) {
    if (!fields) {
      throw new TypeError('No defined fields');
    }

    this.options = options;
    this.fields = sanitizeFields(fields);

    plugins.forEach(plugin => plugin(this));

    Object.freeze(this.fields);   // no further mods!
  }

  /**
  Create a new empty model from the fields' default values specification

  @return {Object}
  */
  createModel() {
    return createModel(this);
  }

  /**
  Create a new validation context based on this schema
  */
  createContext() {
    return new ValidationContext(this);
  }

}
