# Perfect schema

Model and schema validation done perfectly.

## Install

```
npm i -S perfect-schema
```

## Usage

```
import PerfectSchema from 'perfect-schema';

const itemSchema = new PerfectSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    min: 3
  },
  description: {
    type: String,
    optional: true
  },
  qty: {
    type: PerfectSchema.Integer,
    defaultValue: 0
  },
  attributes: {
    type: Object,
    blackbox: true
  }
});

const data = {
  name: 'foo'
};

const validator = await itemSchema.validate(data);

if (!validator.isValid()) {
  console.error(validator.getMessages());
}
```


## license

ISC
