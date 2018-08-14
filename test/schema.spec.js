import assert from 'assert';
import Schema from '../src/schema';
import ValidationContext from '../src/context';


describe('Testing Schema', () => {

  it('should create instance', () => {
    const schema = new Schema({
      foo: String
    });

    assert.strictEqual(typeof schema.options, 'object');
    assert.strictEqual(typeof schema.fields, 'object');
    assert.ok(Array.isArray(schema.fieldNames));
    assert.strictEqual(schema.fieldNames.length, Object.keys(schema.fields).length);
  });


  it('should fail with invalid field name', () => {
    assert.throws(() => new Schema({ '123': String}));
  });


  it('should fail with no fields', () => {
    [
      void 0, null, 0, '', {}
    ].forEach(fields => assert.throws(() => new Schema(fields)));
  });


  it('should fail with invalid fields', () => {
    [
      'hello', 1, new Array(), [], /./, new Date()
    ].forEach(fields => assert.throws(() => new Schema(fields)));
  });


  describe('Testing plugins', () => {

    it('should use plugin', () => {
      function pluginFactory(SchemaPrototype) {
        assert.strictEqual(SchemaPrototype, Schema);

        SchemaPrototype._test = 'static1';

        return function plugin(schema) {
          assert.ok(schema instanceof Schema);

          schema._test = 'instance1';
        }
      };

      Schema.use(pluginFactory);

      const s = new Schema({ foo: String });

      assert.strictEqual(Schema._test, 'static1');
      assert.strictEqual(s._test, 'instance1');

      delete Schema._test;
      while (Schema._plugins.length) Schema._plugins.pop();
    });


    it('should use call preInit and init', () => {
      function pluginFactory(SchemaPrototype) {
        return {
          preInit(schema) {
            assert.ok(schema instanceof Schema);
            schema._preInit = true;
          },
          init(schema) {
            assert.ok(schema instanceof Schema);
            schema._init = true;
          }
        };
      };

      Schema.use(pluginFactory);

      const s = new Schema({ foo: String });

      assert.ok( s._preInit );
      assert.ok( s._init );

      while (Schema._plugins.length) Schema._plugins.pop();
    });


    it('should use plugin (static only)', () => {
      function pluginFactory(SchemaPrototype) {
        assert.strictEqual(SchemaPrototype, Schema);

        SchemaPrototype._test = 'static2';
      };

      Schema.use(pluginFactory);

      const s = new Schema({ foo: String });

      assert.strictEqual(Schema._test, 'static2');
      assert.strictEqual(s._test, void 0);

      delete Schema._test;
      while (Schema._plugins.length) Schema._plugins.pop();
    });


    it('should fail with invalid plugin factory', () => {
      [
        null, void 0,
        -1, 0, 1, '', 'a', {}, [], new Date(), /./
      ].forEach(pluginFactory => assert.throws(() => Schema.use(pluginFactory)));
    });


    it('should invoke all plugin functions', () => {
      function pluginFactory(SchemaPrototype) {
        return {
          preInit(schema) {
            schema._preInit = true;
          },
          init(schema) {
            schema._init = true;
          },
          extendModel(model, schema) {
            model._extended = true;
            schema._model = true;
          },
          extendContext(context, schema) {
            context._extended = true;
            schema._context = true;
          }
        };
      };

      Schema.use(pluginFactory);

      const s = new Schema({ foo: String });
      const m = s.createModel();
      const c = s.createContext();

      assert.ok( s._preInit === true );
      assert.ok( s._init === true );
      assert.ok( s._model === true );
      assert.ok( s._context === true );
      assert.ok( m._extended === true );
      assert.ok( c._extended === true );

      while (Schema._plugins.length) Schema._plugins.pop();

    });

  });


  it('should create model from default values', () => {
    const schema = new Schema({ foo: { type: String, defaultValue: 'hello' } });
    const model = schema.createModel();

    assert.deepStrictEqual( model, { foo: 'hello' } );
  });


  it('should create validation context', () => {
    const schema = new Schema({ foo: String });
    const context = schema.createContext();

    assert.ok( context instanceof ValidationContext );
  });


  it('should get type validation', () => {
    const schema = new Schema({ foo: String });
    const type = schema._type;

    assert.ok( typeof type === 'object' );
    assert.ok( type.$$type.toString().match('^schema\\d+$') );
    assert.ok( typeof type.validatorFactory === 'function' );

    const validator = type.validatorFactory();
    const context = validator.context;

    assert.ok( validator({ foo: 'test' }) === undefined );
    assert.deepStrictEqual( context.getMessages(), {} );


    assert.ok( validator({ foo: false }) === 'invalid' );
    assert.deepStrictEqual( context.getMessages(), { foo: 'invalidType' } );
  });


  it('should be chainable', () => {
    const schema = new Schema({ foo: String });
    const type = schema._type;
    const validator = type.validatorFactory(null, null, schema, (value, options, context) => {
      return 'test';
    });

    console.log( validator({ foo: 'test' }) );

    assert.ok( validator({ foo: 'test' }) === 'test' );
  });


});
