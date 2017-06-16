# Perfect Schema
[![Build Status](https://travis-ci.org/yanickrochon/perfect-schema.svg?branch=master)](https://travis-ci.org/yanickrochon/perfect-schema)
[![Coverage Status](https://coveralls.io/repos/github/yanickrochon/perfect-schema/badge.svg?branch=master)](https://coveralls.io/github/yanickrochon/perfect-schema?branch=master)

[![NPM](https://nodei.co/npm/perfect-schema.png)](https://npmjs.org/package/perfect-schema)

Model and schema validation done perfectly.

## Install

```
npm i -S perfect-schema
```

## Requirements

This modules does not provide a polyfill for a `Promise` impelementation is none is available. If such is the case, an [ECMA-262](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) complient implementation should be defined _before_ declaring any model schema.

A client version of this module can be build using [Grunt](https://gruntjs.com/) : `$ grunt build` which can then be found in the `dist` folder. If installed through [npm](https://www.npmjs.com/package/perfect-schema), these files should already be provided.


## Usage

```js
const PerfectSchema = require('perfect-schema');

const itemSchema = new PerfectSchema({
  _id: String,
  name: {
    type: String,
    required: true,
    min: 3
  },
  qty: {
    type: PerfectSchema.Integer,
    defaultValue: 0
  },
  price: Number,
  tags: [String],
  attributes: Object
});

const item = itemSchema.createModel();  // all default values set

const messages = await item.set({
  name: 'foo'
});

if (!item.isValid()) {
  console.error(messages);
}
```


## Field Types

There are two ways to define a field type; the short way and the descriptive way. The short way is fine when no other options needs to be defined.

```js
const schema = new PerfectSchema({
  field1: String,     // short way
  field2: {
    type: Boolean     // descriptive way
    // options
  }
})
```

### Type : `PerfectSchema.any([type?[, type?[, ...]]])`

Wildcard type, the value may be anything if no type provided, or anyting that match the given types, or `undefined`. Each element `type?` may be a short hand or descriptive type definition. For example

```
{
  a: PerfectSchema.any()
  b: PerfectSchema.any(String),
  c: PerfectSchema.any(String, { type: Boolean }),
  d: PerfectSchema.any(String, { type: Boolean }, { type: Number, min: 0 }),
  ...
}
```

The validations are performed in parallel, and fail if all types mismatch. If all types mismatch, the first error not equal to `invalidType` is returned, or `invalidType` otherwise.



### Type : `Array`| `"array"` | [type?]

Represent any array values or typed array values, or `undefined`. The following are all equivalent :

```
{
  a: Array,
  b: "array",
  c: [],
  d: [PerfectSchema.any()]
}
```

#### Options :

* `min` : the minimum array size
* `max` : the maximum array size


### Type : `[type? ...]`

Represent a typed array, or `undefined`. Typed arrays will test _all_ array elements to make sure they match the specified `type?` (or types). The following are all equivalent :

```
{
  c: [String],
  d: [PerfectSchema.any(String)]
}
```

Multiple types may be defined per array elements. The following are all equivalent :

```
{
  c: [String, { type: Number, min: 0 }],
  d: [PerfectSchema.any(String, { type: Number, min: 0 )]
}
```

Validations are performed in parallel for each array elements, and fail if any type mismatch. The first array element that fail is returned, and the index is set to the error message. For example :

```
{
  a: [String, Number]
}
```

with the given value : `["hello", 123, "world", true, "!!!"]` will fail with the error : `"invalidType@3"`.

#### Options :

* `arrayOptions` : an object passed to the `Array` validator, before evaluating all array elements.


### Type : `Boolean` | `"boolean"`

Represent a boolean value, or `undefined`. If defined, only the values `true` or `false` are valid. Any other value will be rejected (i.e. `0` or `"true"`, etc. are all invalid boolean values).


### Type : `Date` | `"date"`

Represent instances of `Date`, or values of `undefined`. This type does not support numeric or ISO string timestamps.

#### Options :

* `min` : a value that can be compared with a `Date` object, where `value >= min` should be true.
* `max` : a value that can be compared with a `Date` object, where `value <= max` should be true.


### Type : `PerfectSchema.Integer` | `"integer"`

Represent an integer value, or `undefined`. Any non numeric values, or decimal values will be rejected. (**Note:** values such as `Infinity` and `-Infinity` are valid.)

#### Options :

* `min` : a value that can be compared with a number, where `value >= min` should be true.
* `max` : a value that can be compared with a number, where `value <= max` should be true.


### Type : `Number` | `"number"`

Represent an numeric value, or `undefined`. Any non numeric values will be rejected. (**Note:** values such as `Infinity` and `-Infinity` are valid.)

#### Options :

* `min` : a value that can be compared with a number, where `value >= min` should be true.
* `max` : a value that can be compared with a number, where `value <= max` should be true.


### Type : `Object` | `"object"`

Represent some object. Any value such as `{}`, or `Object.create(null)` are valid. But any type, such as `Date`, or `RegExp`, or `Array` are invalid.


### Type : `String` | `"string"`

Represent a string value, or `undefined`.

#### Options :

* `min` : the mimimum length of the string
* `max` : the maximum length of the string


## Field options

The following are general options that can be specified for any type.


### Option : `type: type?`

The field type, may be any of the defined field types.


### Option : `required: Boolean`

Override the default behaviour and disallow `undefined` values from being acceptable.


### Option : `nullable: Boolean`

Override the default behaviour and allow `null` values for the field.


### Option : `defaultValue: function|any?`

When a new model is created, fields with a default value will be initially set. This option may be a constant, in which case it will be set to the model, or a function returning the value to set.

If `defaultValue` is a function, it will be called without any argument. If the returned value is a Promise, the default value is considered asynchronous, and whatever value is resolved will be set as initial field value. Also, this function will initially be called when creating a schema, passing `true` as first argument, indicating that the function is simulated.

When creating schemas, all default values _are_ validated once, and warnings will be issued if they do not pass the field's defined validation specifications. This validation process is intended for debugging purposes only.

Once the schema is created, default values are not validated when initially set to models. It is the responsibility of the application to make sure these values are conform with the schema.


### Option : `custom: function`

A function that is called after the type check validation to add custom validation criteria to the field. The function receives two arguments : `value` and `context`. The first argument is the value being set, and the context is an object providing functionality to fetch other fields from the validating model. The context of the custom validator are the field's type specifications.

For example :

```js
{
  pass: {
    type: String,
    min: 6,
    max: 24,
    custom(value, ctx) {
      // this.min = 6, this.max = 24
      return value === ctx.field('confirmPass').value || 'mismatch';
    }
  },
  confirmPass: String
```

For asynchronous custom validation, the function may return a Promise. For example :

```js
{
  coupon: {
    type: String,
    custom(value) {
      return Promise.resolve(validateCoupon(value));
    }
  }
}
```

For synchrnous validation, the function should return a String. For Asynchronous validation, the Promise should resolve with a String. If an error is thrown, either synchronously or asynchronously, the field will failed with an `error` message.


## Custom validators

Schemas can be enhenced with custom validations. These user-defined validators
are functions that return `undefined` when all is fine, or return the error
message as a `String`.

### Example: synchronous user-defined validator

```js
/**
@param field {string}   the field name being validated
@param specs {object}   the field specs as defined in the schema, for example
@param next {function}  the next validator function that this validator should wrap around
@return {function}
*/
function customValidator(field, specs, next) {
  /**
  @param value {any}                  the value being validated
  @param context {ValidationContext}  self documented
  @return {string|Promise|undefined}
  */
  return validator(value, context) {
    // i.e. if some validation fails
    if (someValidation(value) === false) {
      // return the error message
      return 'error';
    } else {
      // else, return whatever the next validator returns
      return next(value, context);
    }
  };
}
```

### Example: asynchronous user-defined validator

```js
/**
@param field {string}   the field name being validated
@param specs {object}   the field specs as defined in the schema, for example
@param next {function}  the next validator function that this validator should wrap around
@return {function}
*/
function customValidator(field, specs, next) {
  /**
  @param value {any}                  the value being validated
  @param context {ValidationContext}  self documented
  @return {string|Promise|undefined}
  */
  return validator(value, context) {
    return someValidation(value).then(result => {
      if (result === error) {
        return 'error';
      } else {
        return next(value, context);
      }
    });
  };
}
```

## license

ISC
