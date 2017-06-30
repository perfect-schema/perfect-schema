# Perfect Schema
[![Build Status](https://travis-ci.org/perfect-schema/perfect-schema.svg?branch=master)](https://travis-ci.org/perfect-schema/perfect-schema)
[![Coverage Status](https://coveralls.io/repos/github/perfect-schema/perfect-schema/badge.svg?branch=master)](https://coveralls.io/github/perfect-schema/perfect-schema?branch=master)

[![NPM](https://nodei.co/npm/perfect-schema.png)](https://npmjs.org/package/perfect-schema)

Model and schema validation done perfectly.

## Install

```
npm i -S perfect-schema
```

## Requirements

This modules does not provide a polyfill for a global `Promise` impelementation if none is available. If such is the case, an [ECMA-262](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) complient implementation should be defined _before_ declaring any schema.

A client version of this module can be built using [Gulp](http://gulpjs.com/) (i.e. `$ gulp`) which can then be found in the `dist` folder. If installed through [npm](https://www.npmjs.com/package/perfect-schema), this file should already be provided as `dist/perfect-schema.min.js`. The client module is wrapped by a UMD, and also globally exposes a `PerfectSchema` constructor.


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

## Documentation

Read the [documentation](https://perfect-schema.github.io) for more information.


## license

ISC
