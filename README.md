# Perfect Schema
[![Build Status](https://travis-ci.org/perfect-schema/perfect-schema.svg?branch=master)](https://travis-ci.org/perfect-schema/perfect-schema)
[![Coverage Status](https://coveralls.io/repos/github/perfect-schema/perfect-schema/badge.svg?branch=master)](https://coveralls.io/github/perfect-schema/perfect-schema?branch=master)

Model and schema validation done perfectly.


## Install

```
npm i -S @perfect-schema/base
```

## Usage

```js
import PerfectSchema from '@perfect-schema/base';

const itemSchema = new PerfectSchema({
  _id: String,
  name: {
    type: String,
    required: true,
    min: 3
  },
  qty: {
    type: Number,
    defaultValue: 0
  },
  price: Number
});

const cartItemSchema = new PerfectSchema({
  itemId: String,
  qty: Number
});

const cartSchema = new PerfectSchema({
  _id: String,
  userId: String,
  items: PerfectSchema.ArrayOf(cartItemSchema)
})

const context = cartSchema.createContext();
const item = cartSchema.createModel({
  items: [{
    name: 'foo'
  }]
});


if (!context.validate(item)) {
  // context.isValid() == false
  console.error(context.getMessages());
}
```

## Documentation

* [API reference](/docs/api.md)
* [Field types](/docs/types.md)
* [Plugins and extending PerfectSchema](/docs/plugins.md)
* [About this project](/docs/about.md)


## license

MIT
