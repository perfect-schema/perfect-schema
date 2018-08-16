# API Reference

## PerfectSchema

### Usage

```js
import PerfectSchema from '@perfect-schema/base';

const schema = new PerfectSchema({
  foo: type%,
  bar: {
    type: type%,
    // ...
  }
});
```

### Definitions

---

#### :large_blue_diamond: _static method_ `use(pluginFactory)`

Make all schema use the given plugin created by the specified plugin factory,
a function returning either a function or an object.

##### Arguments

* **pluginFactory** : `function`
  > A function returning a plugin.

##### Returns

* Nothing.

##### Example

```js
function pluginFactory1(PerfectSchema) {
  return (schema) => { /* ... */ };
};

function pluginFactory2(PerfectSchema) {
  return {
    preInit: (schema, fields, options) => { /* ... */ },
    init: (schema) => { /* ... */ },
    extendModel: (model, schema) => { /* ... */ },
    extendContext: (context, schema) => { /* ... */ }
  };
};
```

---

#### :small_orange_diamond: _property_ `fields`

The normalized fields specification.

---

#### :small_orange_diamond: _property_ `fieldNames`

The `array` consisting of the list of specified field names.

---

#### :new: __constructor__ `PerfectSchema(fields, options)`

Create a new schema given the specified fields. Options are used only by plugins.

##### Arguments

* **fields** : `Object`
  > An object of field specifications.
* **options** : `Object` *(Optional)*
  > Options passed to the schema as required by plugins, etc.

---

#### :large_orange_diamond: _method_ `createContext()`

Create a new validation context based on the given schema.

##### Returns

* `ValidationContext`

---

#### :large_orange_diamond: _method_ `reateModel(data)`

Create a new model based on the schema's specifications. The returned model
is a POJO object containing the required fields, or fields with defined default values.

##### Arguments

* **data** : `Object`
  > The default data to set for the model. This data will be extended if necessary
  > with the schema fields' default values. No validation is performed on this data.

##### Returns

* `Object`

##### Example

```js
const user = userSchema.createModel({
  username: 'john.doe',
  password: '53cr37'
});
// { username: 'john.doe', password: '53cr37', active: true, createdAt: ... }</code></pre>
```

---

## ValidationContext

### Usage

```js
const context = schema.createContext();
```

### Definitions

---

#### :new: __constructor__ `ValidationContext(schema)`

Create a new schema validator.

##### Arguments

* **schema** : `PerfectSchema`
  > The schema to create a validator for.

---

#### :large_orange_diamond: _method_ `getMessage(field)`

Return the validation message for the given field. If the field is valid, the method returns undefined.

##### Arguments

* **field** : `String`
  > The field name to return the message for.

##### Returns

* `String` | `undefined`

---

#### :large_orange_diamond: _method_ `getMessages()`

Return a shallow copy of the validation messages.

##### Returns

* `Object`

---

#### :large_orange_diamond: _method_ `isValid()`

Is the last current validation context valid?

##### Returns

* `Boolean`

---

#### :large_orange_diamond: _method_ `reset()`

Reset all messages from the validation context, and set it as valid.

---

#### :large_orange_diamond: _method_ `setMessage(field, message)`

Set a validation message for the specified field. The field name must exist in the schema. The
method can also be used to set sub-schema validation messages. All messages are reset automatically,
including sub-schema messages, when the context is revalidated or reset.

##### Arguments

* **field** : `String`
  > The field name as string.
* **message** : `String` *(Optional)*
  > The message as string, or any falsy value to reset the field.

##### Example

```js
context.setMessage('foo', 'message');
context.setMessage('foo.bar', 'another');
context.getMessages();
// { 'foo': 'message', 'foo.bar': 'another' }
context.getMessage('foo');
// 'message'
```

---

#### :large_orange_diamond: _method_ `validate(data, options)`

Validate the given value against the validation context's specified schema. The options will be passed
to each validation functions. The function returns whether the context is valid or not after the
validation.

##### Arguments

* **data** : `mixed`
  > The data to validate.
* **options** : `Object` *(Optional)*
  > The options to pass to the validators.

##### Example

```js
context.validate({
  foo: 'Hello',
  bar: true
});
// true
```
