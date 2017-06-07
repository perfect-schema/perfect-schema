# Perfect schema

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


## Field options

### type : string | type


### required : Boolean


### nullable : Boolean


### defaultValue : function | any


### custom : function


## license

ISC
