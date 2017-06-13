'use strict';


const plugins = [
  requiredPlugin,
  nullablePlugin,
  customPlugin
];


/**
Register a new plugin. This new plugin will be added after the required and nullable plugin,
after any other registered plugin, and before the custom plugin. If the plugin was already
registered, it is ignored; unregister the plugin, first, before registering again.

@param plugin {function}
*/
function registerPlugin(plugin) {
  if (typeof plugin !== 'function') {
    throw new TypeError('Plugin must be a function');
  }

  if (plugins.indexOf(plugin) === -1) {
    // TODO : add insertion index
    plugins.splice(plugins.length - 1, 0, plugin);
  }
};


/**
Unregister the given plugin.

@param plugin {function}
*/
function unregisterPlugin(plugin) {
  const pluginIndex = plugins.indexOf(plugin);

  if (pluginIndex !== -1) {
    plugins.splice(pluginIndex, 1);
  }
}


/**
Apply the registered plugins to the validator, according to the defined specs.

@param specs {Object} some field specifications
@param validator {function} the function validator.
@return {function}
*/
function applyPlugins(specs, validator) {
  for (var i = 0, len = plugins.length; i < len; ++i) {
    validator = plugins[i](specs, validator);
  }

  return validator;
}


/**
This plugin will ensure that the field is defined in the model

@param specs {object}   the field specs
@return {function}
*/
function requiredPlugin(specs, validator) {
  if (specs.required) {
    /**
    Ensure that the value is set. If the value is undefined, the error "required"
    is returned. Otherwise, the validation is forwared to the validator function,
    and whatever value is returned.

    @param value {any}
    @return {string|undefined}
    */
    return function required(value) {
      if (value === undefined) {
        return 'required';
      } else {
        return validator(value);
      }
    };
  } else {
    return validator;
  }
}

/**
This plugin will allow null values for a field.

@param specs {object}   the field specs
@return {function}
*/
function nullablePlugin(specs, validator) {
  if (specs.nullable) {
    /**
    Allow null values.

    @param value {any}
    @return {string|undefined}
    */
    return function nullable(value) {
      if (value !== null) {
        return validator(value);
      }
    };
  } else {
    return function notNullable(value) {
      if (value === null) {
        return 'noValue';
      } else {
        return validator(value);
      }
    };
  }
}


/**
This plugin will allow custom validators to be defined in the specs

@param specs {object}   the field specs
@return {function}
*/
function customPlugin(specs, validator) {
  if ('custom' in specs) {
    if (typeof specs.custom !== 'function') {
      throw new TypeError('Custom validator should be a function');
    }

    const custom = specs.custom.bind(specs);

    function callValidator(validator, value, ctx, nextValidator) {
      const result = validator(value, ctx);

      if (typeof result === 'string') {
        return result;
      } else if (result instanceof Promise) {
        return result.then(message => {
          if (typeof message === 'string') {
            return message;
          } else {
            return nextValidator ? callValidator(nextValidator, value, ctx) : undefined;
          }
        });
      } else {
         return nextValidator ? callValidator(nextValidator, value, ctx) : undefined;
      }
    }

    /**
    Invoke the custom validator function if all current validation passes

    @param value {any}
    @param ctx {ValidationContext}   the validation context
    @return {string|undefined}
    */
    return function customValidator(value, ctx) {
      return callValidator(validator, value, ctx, custom);
    };
  } else {
    return validator;
  }
}


module.exports.registerPlugin = registerPlugin;
module.exports.unregisterPlugin = unregisterPlugin;
module.exports.applyPlugins = applyPlugins;
