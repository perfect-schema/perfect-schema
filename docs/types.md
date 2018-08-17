# Field Types

## Primitives


### `Array`

The field should be an array. For an array of specified elements, consider using `PerfectSchema.ArrayOf(type%)`


### `Boolean`

The field should be a strict boolean value of `true` or `false`.


### `Date`

The field should be an instance of `Date` and be a valid date value.


### `Number`

The field should be a strict number between, and not `NaN`.


### `Object`

The field should be an instanceo of `Object`.


### `String`

The field should be a string.


## Built-in types

### `PerfectSchema.Any`

A wildcard type whose value can be anything. This is intended to be an unchecked, blackbox type.

```js
const schema = new PerfectSchema({
  foo: PerfectSchema.Any,
  bar: {
    type: PerfectSchema.Any
  }
});
```

### `PerfectSchema.ArrayOf(type%)`

Like the `Array` type, but specify element type(s).

```js
const schema = new PerfectSchema({
  foo: PerfectSchema.ArrayOf(String),
  bar: {
    type: PerfectSchema.ArrayOf(PerfectSchema.AnyOf(String, Number))
  }
});
```


### `PerfectSchema.AnyOf(type%[, type%[, ...]])`

Like the `Any` built-in type, but restricts the actual wildcard types.

```js
const schema = new PerfectSchema({
  foo: PerfectSchema.AnyOf(String, Number, Date),
  bar: {
    type: PerfectSchema.ArrayOf(PerfectSchema.AnyOf(String, Number))
  }
});
```
