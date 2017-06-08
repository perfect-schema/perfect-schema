# Perfect schema
[![Build Status](https://travis-ci.org/yanickrochon/perfect-schema.svg?branch=master)](https://travis-ci.org/yanickrochon/perfect-schema)
[![Coverage Status](https://coveralls.io/repos/github/yanickrochon/perfect-schema/badge.svg?branch=master)](https://coveralls.io/github/yanickrochon/perfect-schema?branch=master)

[![NPM](https://nodei.co/npm/perfect-schema.png)](https://npmjs.org/package/perfect-schema)

Model and schema validation done perfectly.

## Install

```
npm i -S perfect-schema
```

## Usage

```
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

```json
{
  field1: type,
  field2: {
    type: type
    ...
  }
}
```

* **Type** : PerfectSchema.any(type?)

* **Type** : Array | `"array"` | [type?]

  Field of this type are generic arrays or typed arrays. The following are all equivalent :

  ```
  {
    a: Array,
    b: "array",
    c: [],
    d: [PerfectSchema.any()]
  }
  ```


* **Type** : Boolean | `"boolean"`

* **Type** : Date | `"date"`

* **Type** : PerfectSchema.Integer | `"integer"`

* **Type** : Number | `"number"`

* **Type** : Object | `"object"`

* **Type** : String | `"string"`




## Field options

### type : string | type


### required : Boolean


### nullable : Boolean


### defaultValue : function | any


### custom : function


## license

ISC
