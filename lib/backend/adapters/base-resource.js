"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _baseRecord = _interopRequireDefault(require("./base-record"));

var _resourceDecorator = _interopRequireDefault(require("../decorators/resource-decorator"));

var _notImplementedError = _interopRequireDefault(require("../utils/not-implemented-error"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable @typescript-eslint/no-empty-function */

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint class-methods-use-this: 0 no-unused-vars: 0 */

/* eslint no-useless-constructor: 0 */

/**
 * Representation of a ORM Resource in AdminBro. Visually resource is a list item in the sidebar.
 * Each resource has many records and many properties.
 *
 * Analogy is REST resource.
 *
 * It is an __abstract class__ and all database adapters should implement extend it implement
 * following methods:
 *
 * - (static) {@link BaseResource.isAdapterFor isAdapterFor()}
 * - {@link BaseResource#databaseName databaseName()}
 * - {@link BaseResource#name name()}
 * - {@link BaseResource#id id()}
 * - {@link BaseResource#properties properties()}
 * - {@link BaseResource#property property()}
 * - {@link BaseResource#count count()}
 * - {@link BaseResource#find find()}
 * - {@link BaseResource#findOne findOne()}
 * - {@link BaseResource#create create()}
 * - {@link BaseResource#update update()}
 * - {@link BaseResource#delete delete()}
 * @category Base
 * @abstract
 * @hideconstructor
 */
class BaseResource {
  /**
   * Checks if given adapter supports resource provided by the user
   *
   * @param  {any}  rawResource resource provided in AdminBroOptions#resources array
   * @return {Boolean}          if given adapter supports this resource - returns true
   * @abstract
   */
  static isAdapterFor(rawResource) {
    throw new _notImplementedError.default('BaseResource.isAdapterFor');
  }
  /**
   * Creates given resource based on the raw resource object
   *
   * @param   {Object}  resource
   */


  constructor(resource) {
    this._decorated = null;
  }
  /**
   * The name of the database to which resource belongs. When resource is
   * a mongoose model it should be database name of the mongo database.
   *
   * Visuall, by default, all resources are nested in sidebar under their database names.
   * @return {String}         database name
   * @abstract
   */


  databaseName() {
    throw new _notImplementedError.default('BaseResource#databaseName');
  }
  /**
   * Returns type of the database. It is used to compute sidebar icon for
   * given resource. Default: 'database'
   * @return {String}
   */


  databaseType() {
    return 'database';
  }
  /**
   * Return name of the resource.
   * It could be a table name in SQL database, or collection name in mongoDB.
   *
   * Visually it will be shown as the name of the resource in the UI.
   * @return {String}
   * @abstract
   */


  name() {
    throw new _notImplementedError.default('BaseResource#name');
  }
  /**
   * Each resource has to have uniq id which will be put to an URL of AdminBro routes.
   * For instance in {@link Router} path for the `new` form is `/resources/{resourceId}/new`
   * @return {String} uniq resource id
   * @abstract
   */


  id() {
    throw new _notImplementedError.default('BaseResource#id');
  }
  /**
   * returns array of all properties which belongs to resource
   * @return {BaseProperty[]}
   * @abstract
   */


  properties() {
    throw new _notImplementedError.default('BaseResource#properties');
  }
  /**
   * returns property object for given field
   * @param {String} path           path/name of the property. Take a look at
   *                                {@link BaseProperty} to learn more about
   *                                property paths.
   * @return {BaseProperty}
   * @abstract
   */


  property(path) {
    throw new _notImplementedError.default('BaseResource#property');
  }
  /**
   * Returns number of elements for given resource by including filters
   * @param  {Object} filters what data should be included
   * @return {Promise<Number>}
   * @abstract
   */


  async count(filters) {
    throw new _notImplementedError.default('BaseResource#count');
  }
  /**
   * Returns actual records for given resource
   *
   * @param  {Object} filters                        what data should be included
   * @param  {Object|String} [filters.fieldName]   when filter for given field should be treaten
   *                                                 as a String it contains query as a String
   * @param  {String} [filters.fieldName.from]       for date filters it contains optional
   *                                                 from and to parameters which are String
   * @param  {String} [filters.fieldName.to]
   * @param  {Object} options
   * @param  {Number} options.limit                  how many records should be taken
   * @param  {Number} options.offset                 offset
   * @param  {Object} options.sort                   sort
   * @param  {Number} options.sort.sortBy            sortable field
   * @param  {Number} options.sort.direction         either asc or desc
   * @return {Promise<BaseRecord[]>}                          list of records
   * @abstract
   * @example
   * // filters example
   * {
   *    name: 'Tom',
   *    createdAt: { from: '2019-01-01', to: '2019-01-18' }
   * }
   */


  async find(filters, options) {
    throw new _notImplementedError.default('BaseResource#find');
  }
  /**
   * Populates records with references for given property.
   *
   * Example: Let say resource `Article` has property `user_id` and it is a reference
   * to `User` resource. When you call this `User.populate([...articleRecords], userIdProperty)`
   * it should populate `articleRecords` with corresponding users.
   * So after that invoking `articleRecord.populated['user_id']` will return the user Record
   *
   * @param   {Array<BaseRecord>}  records  all records which should be populated
   * @param   {BaseProperty}  property      property which is a reference to `this` Resource
   *
   * @return  {Promise<Array<BaseRecord>>}  populated records
   */


  async populate(records, property) {
    throw new _notImplementedError.default('BaseResource#populate');
  }
  /**
   * Finds one Record in the Resource by its id
   * @param  {String} id      uniq id of the Resource Record
   * @return {Promise<BaseRecord>}   record
   * @abstract
   */


  async findOne(id) {
    throw new _notImplementedError.default('BaseResource#findOne');
  }
  /**
   * Builds new Record of given Resource.
   *
   * Each Record is an representation of the resource item. Before it can be saved,
   * it has to be instantiated.
   *
   * @param  {Object} params
   * @return {BaseRecord}
   */


  build(params) {
    return new _baseRecord.default(params, this);
  }
  /**
   * Creates new record
   * @param  {Object} params
   * @return {Promise<Object>}         created record converted to raw Object which
   *                                   can be used to initiate new {@link BaseRecord} instance
   * @throws {ValidationError} If there are validation errors it should be thrown
   * @abstract
   */


  async create(params) {
    throw new _notImplementedError.default('BaseResource#create');
  }
  /**
   * Updates an object
   * @param  {String} id      uniq id of the Resource Record
   * @param  {Object} params
   * @return {Promise<Object>}         created record converted to raw Object which
   *                                   can be used to initiate new {@link BaseRecord} instance
   * @throws {ValidationError} If there are validation errors it should be thrown
   * @abstract
   */


  async update(id, params) {
    throw new _notImplementedError.default('BaseResource#update');
  }
  /**
   * Delete given record by id
   *
   * @param  {String|Number} id id of the Record
   * @abstract
   */


  async delete(id) {
    throw new _notImplementedError.default('BaseResource#delete');
  }
  /**
   * Assigns given decorator to the Resource. Than it will be available under
   * resource.decorate() method
   *
   * @param  {BaseDecorator}  Decorator
   * @param  {AdminBro}       admin         current instance of AdminBro
   * @param  {AdminBro~ResourceOptions} [options]
   */


  assignDecorator(admin, options = {}) {
    this._decorated = new _resourceDecorator.default({
      resource: this,
      admin,
      options
    });
  }
  /**
   * Gets decorator object for given resource
   * @return {BaseDecorator | null}
   */


  decorate() {
    if (!this._decorated) {
      throw new Error('resource don\'t have assinged decorator yet');
    }

    return this._decorated;
  }

}

var _default = BaseResource;
exports.default = _default;