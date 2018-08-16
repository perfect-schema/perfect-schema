# About

Perfect Schema is an effort that is meant to resolve a few main concerns that
I had with other similar projects :

* I did not need a collection API
* I did not want my data to be manipulated automatically
* I was not happy with some design decisions of other projects
* I wanted the source code to be easy to read and extend
* I wanted all these features with a small footprint

The purpose of Perfect Schema is to provide functionality for data integrity
from user inputs in an application. That's it!

In JavaScript data is commonly stored as objects, transmitted as JSON, and persisted
as documents. Therefore, it is a waste of time to wrap everything with typed models.
Applications usually only need to validate changes in it's data when necessary,
for example, when the changes are coming from external actors such as a third
party system, a user, etc.

Also, since collections can range from trival implementations to complex
self-synchronizing structures, depending on the project's requirements, such
implementation is outside the scope of data validation. Therefore, it is a waste
of space to provide such functionality.

For all these reasons, and more, Perfect Schema is lightweight, fast and integrate
easily with just about any project.

## Example

```js
const itemSchema = new PerfectSchema({
  sku: {
    type: String,
    required: true,
    min: 3
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    default: 0,
    min: 0
  }
});

const item = itemSchema.createModel({
  sku: 'abc',
  name: 'Foo Item',
  price: -96.99
});

const validator = itemSchema.createContext();

if (!validator.validate(item)) {
  console.error(validator.getMessage('price'));
  // -> 'minNumber'
}
```
