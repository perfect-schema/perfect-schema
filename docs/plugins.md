# Plugins

Plugins are a way <code>PerfectSchema</code> can be extended with more feature-rich validations
and features.

## Creating a plugin

### The Plugin Factory

The plugin factory is a function receiving a single argument; the `PerfectSchema`
prototype. It is useful to either extend `PerfectSchema` statically, or add methods
to the prototype.

```js
const customValidator = PerfectSchema => (schema) => {
  // at this stage, the schema is already initiallized
  // and schema.fields are normalized with validators
  // any return value will be ignored.

  schema.fieldNames.forEach(fieldName => {
    const field = schema.fields[fieldName];

    if (typeof field.custom === 'function') {
      field.validator = applyCustomValidator(field, field.validator);
    }
  })
};

// ...

PerfectSchema.use(customValidator);


const schema = new PerfectSchema({
  foo: {
    type: String,
    custom(value) {
      // called by the new custom validator plugin
    }
  }
});
```

The previous method is for basic plugins, typically ones declaring new types or new
validation methods. However, the following provides a better control while extending
`PerfectSchema` and it's instances,

```js
const customValidator = PerfectSchema => ({
  /**
   * At this stage, the schema has not been initialized
   * and is virtually empty. The fields and options
   * arguments have not yet been normalized.
   *
   * Any return value will be ignored.
   */
  //preInit(schema, fields, options) { },

  /**
   * At this stage, the schema is already initiallized
   * and schema.fields are normalized with validators
   *
   * Any return value will be ignored.
   */
  init(schema) {
    schema.fieldNames.forEach(fieldName => {
      const field = schema.fields[fieldName];

      if (typeof field.custom === 'function') {
        const custom = field.custom.bind(schema);
        const validator = field.validator;

        field.validator = (value, self, context) => validator(value, self, context) || custom(value, self, context);
      }
    });
  },

  /**
   * At this stage, the model has already been created and initialized with the
   * default values as defined by the fields and data passed to the schema's
   * <code>createModel</code> function.
   *
   * Any return value will be ignored.
   */
  //extendModel(model, schema) { },

  /**
   * At this stage, the <code>ValidationContext</code> has already been created,
   * and ready to validate data.
   *
   * Any return value will be ignored.
   */
  //extendContext(context, schema) { }
});

// ...

PerfectSchema.use(customValidator);


const schema = new PerfectSchema({
  foo: {
    type: String,
    custom(value) {
      // called by the new custom validator plugin
    }
  }
});
```


## Available plugins

### Official plugins

* [Standard validators](https://perfect-schema.github.io/standard-validators/)
* [Extending Schemas](https://perfect-schema.github.io/extends/)
* [Meteor enabled Schemas](https://perfect-schema.github.io/tracker/)
