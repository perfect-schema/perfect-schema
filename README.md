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
