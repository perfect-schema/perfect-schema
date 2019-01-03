# Field Types

## Primitives

Below is a list of general options supported by all primitive and built-in types.

##### Options

* **required** : `boolean`
  > The value is required and may not be undefined, though may be `null`. *(Default: `false`)*
* **nullable** : `boolean`
  > The value may or may not be null. *(Default: `true`)*


### :zap: `Array`

The field should be an array. For an array of specified elements, consider using `PerfectSchema.ArrayOf(type%)`

##### Options

* **minCount** : `Number`
  > The minimum number of elements allowed in the array *(Default: `0`)*
* **maxCount** : `Number`
  > The maximum number of elements allowed in the array *(Default: `Infinity`)*


### :zap: `Boolean`

The field should be a strict boolean value of `true` or `false`.


### :zap: `Date`

The field should be an instance of `Date` and be a valid date value.

##### Options

* **minDate** : `Date|Number`
  > The earliest date allowed *(Default: `-Infinity`)*
* **maxDate** : `Date|Number`
  > The latest date allowed *(Default: `Infinity`)*


### :zap: `Number`

The field should be a strict number, and not `NaN`.

##### Options

* **minNumber** : `Number`
  > The smallest value allowed *(Default: `-Infinity`)*
* **maxNumber** : `Number`
  > The highest value allowed *(Default: `Infinity`)*


### :zap: `Object`

The field should be an instanceo of `Object`.


### :zap: `String`

The field should be a string.

##### Options

* **minLength** : `Number`
  > The smallest string allowed *(Default: `0`)*
* **maxLength** : `Number`
  > The largest string allowed *(Default: `Infinity`)*


## Built-in types

### :zap: `PerfectSchema.Any`

A wildcard type whose value can be anything. This is intended to be an unchecked, blackbox type.

```js
const schema = new PerfectSchema({
  foo: PerfectSchema.Any,
  bar: {
    type: PerfectSchema.Any
  }
});
```


### :zap: `PerfectSchema.AnyOf(type%[, type%[, ...]])`

Like the `Any` built-in type, but restricts the actual wildcard types.

```js
const schema = new PerfectSchema({
  foo: PerfectSchema.AnyOf(String, Number, Date),
  bar: {
    type: PerfectSchema.ArrayOf(PerfectSchema.AnyOf(String, Number))
  }
});
```


### :zap: `PerfectSchema.ArrayOf(type%)`

Like the `Array` type, but specify element type(s).

```js
const schema = new PerfectSchema({
  foo: PerfectSchema.ArrayOf(String),
  bar: {
    type: PerfectSchema.ArrayOf(PerfectSchema.AnyOf(String, Number))
  }
});
```

##### Options

All options from :zap:`Array` are inherited.

* **timeout** : `Number`
  > The timeout in milliseconds before array element validation should abort *(Default: `200`)*
  >
  > **Warning** : validation will not return until all array elements are either checked or
  > when the timeout expires.


### :zap: `PerfectSchema.Integer`

The field should be a strict integer between, and not be `Infinity` or `NaN`.

```js
const schema = new PerfectSchema({
  foo: PerfectSchema.Any,
  bar: {
    type: PerfectSchema.Integer
  }
});
```

##### Options

All options from :zap:`Number` are inherited.
