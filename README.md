# Perfect Schema

Model and schema validation done perfectly.

**Note:** this is a module in development! Proper CI and Coverage reports will be mentioned when ready to use.


## Install

More information, soon!


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

const context = itemSchema.createContext();
const item = itemSchema.createModel({
  name: 'foo'
});


if (!context.validate(item)) {
  // context.isValid() == false
  console.error(context.getMessages());
}
```

## Documentation

More information, soon!


## license

ISC
