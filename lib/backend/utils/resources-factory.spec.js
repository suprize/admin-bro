"use strict";

var _resourcesFactory = _interopRequireDefault(require("./resources-factory"));

var _baseDatabase = _interopRequireDefault(require("../adapters/base-database"));

var _baseResource = _interopRequireDefault(require("../adapters/base-resource"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('ResourcesFactory', function () {
  describe('._convertDatabases', function () {
    context('no adapter defined', function () {
      it('throws an error when there are no adapters and database is given', function () {
        expect(() => {
          new _resourcesFactory.default()._convertDatabases(['one']);
        }).to.throw().property('name', 'NoDatabaseAdapterError');
      });
      it('returns empty array when none databases were given', function () {
        expect(new _resourcesFactory.default()._convertDatabases([])).to.have.lengthOf(0);
      });
    });
    context('one adapter defined', function () {
      beforeEach(function () {
        this.resourcesInDatabase = 5;

        class Database extends _baseDatabase.default {
          static isAdapterFor(database) {
            return database === 'supported';
          }

          resources() {
            return new Array(5);
          } // eslint-disable-line class-methods-use-this


        }

        class Resource extends _baseResource.default {}

        this.resourcesFactory = new _resourcesFactory.default({}, [{
          Database,
          Resource
        }]);
      });
      it('takes resources from databases', function () {
        expect(this.resourcesFactory._convertDatabases(['supported'])).to.have.lengthOf(this.resourcesInDatabase);
      });
      it('throws an error when there are no adapters supporting given database', function () {
        expect(() => {
          this.resourcesFactory._convertDatabases(['not supported']);
        }).to.throw().property('name', 'NoDatabaseAdapterError');
      });
    });
  });
  describe('._convertResources', function () {
    context('there are no adapters', function () {
      it('throws an error when resource is not subclass from BaseResource', function () {
        expect(() => {
          new _resourcesFactory.default({})._convertResources(['one']);
        }).to.throw().property('name', 'NoResourceAdapterError');
      });
      it('returns given resource when it is subclass from BaseResource', function () {
        class MyResource extends _baseResource.default {}

        expect(new _resourcesFactory.default({})._convertResources([new MyResource()])).to.have.lengthOf(1);
      });
    });
    context('there is one adapter', function () {
      beforeEach(function () {
        class Database extends _baseDatabase.default {}

        class Resource extends _baseResource.default {
          static isAdapterFor(resource) {
            return resource === 'supported';
          }

        }

        this.resourcesFactory = new _resourcesFactory.default({}, [{
          Database,
          Resource
        }]);
        this.Resource = Resource;
      });
      it('throws an error when resource is not handled by the adapter', function () {
        expect(() => {
          this.resourcesFactory._convertResources(['not supported']);
        }).to.throw().property('name', 'NoResourceAdapterError');
      });
      it('throws an error when resource is not handled by the adapter and its provided with a decorator', function () {
        expect(() => {
          this.resourcesFactory._convertResources([{
            resource: 'not supported',
            decorator: 'sth'
          }]);
        }).to.throw().property('name', 'NoResourceAdapterError');
      });
      it('converts given resource to Resource class provided in the adapter', function () {
        const resources = this.resourcesFactory._convertResources(['supported']);

        expect(resources).to.have.lengthOf(1);
        expect(resources[0].resource).to.be.an.instanceOf(this.Resource);
      });
      it('converts to Resource class when resource is provided with options', function () {
        const options = {};

        const resources = this.resourcesFactory._convertResources([{
          resource: 'supported',
          options
        }]);

        expect(resources).to.have.lengthOf(1);
        expect(resources[0].resource).to.be.an.instanceOf(this.Resource);
        expect(resources[0].options).to.deep.equal(options);
      });
    });
  });
  describe('_decorateResources', function () {
    beforeEach(function () {
      this.resourcesFactory = new _resourcesFactory.default({
        options: {}
      }, []);
      this.assignDecoratorStub = this.sinon.stub(_baseResource.default.prototype, 'assignDecorator');
    });
    it('assigns ResourceDecorator when no options were gicen', function () {
      this.resourcesFactory._decorateResources([{
        resource: new _baseResource.default()
      }]);

      expect(this.assignDecoratorStub).to.have.been.calledWith(this.sinon.match.any, this.sinon.match.falsy);
    });
    it('assigns ResourceDecorator with options when there were given', function () {
      const options = {
        name: 'somename'
      };
      const resource = new _baseResource.default();

      this.resourcesFactory._decorateResources([{
        resource,
        options
      }]);

      expect(this.assignDecoratorStub).to.have.been.calledWith(this.sinon.match.any, this.sinon.match.same(options));
    });
  });
});