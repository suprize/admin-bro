"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DEFAULT_MAX_COLUMNS_IN_LIST = void 0;

var _ = _interopRequireWildcard(require("lodash"));

var _baseProperty = _interopRequireDefault(require("../adapters/base-property"));

var _propertyDecorator = _interopRequireDefault(require("./property-decorator"));

var _actionDecorator = _interopRequireDefault(require("./action-decorator"));

var _viewHelpers = _interopRequireDefault(require("../utils/view-helpers"));

var _configurationError = _interopRequireDefault(require("../utils/configuration-error"));

var ACTIONS = _interopRequireWildcard(require("../actions/index"));

var _propertyJson = require("./property-json.interface");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Default maximum number of items which should be present in a list.
 *
 * @type {Number}
 * @private
 */
const DEFAULT_MAX_COLUMNS_IN_LIST = 8;
/**
 * Base decorator class which decorates the Resource.
 *
 * @category Decorators
 */

exports.DEFAULT_MAX_COLUMNS_IN_LIST = DEFAULT_MAX_COLUMNS_IN_LIST;

class ResourceDecorator {
  /**
   * @param  {object}       options
   * @param  {BaseResource} options.resource  resource which is decorated
   * @param  {AdminBro}     options.admin  current instance of AdminBro
   * @param  {ResourceOptions} [options.options]
   */
  constructor({
    resource,
    admin,
    options = {}
  }) {
    this.getPropertyByKey = this.getPropertyByKey.bind(this);
    this._resource = resource;
    this._admin = admin;
    this.h = new _viewHelpers.default({
      options: admin.options
    });
    /**
     * Options passed along with a given resource
     * @type {ResourceOptions}
    */

    this.options = options;
    this.options.properties = this.options.properties || {};
    /**
     * List of all decorated properties
     * @type {Array<PropertyDecorator>}
     */

    this.properties = this.decorateProperties();
    /**
     * Actions for a resource
     * @type {Object<String, ActionDecorator>}
     */

    this.actions = this.decorateActions();
  }
  /**
   * Used to create an {@link ActionDecorator} based on both
   * {@link AdminBro.ACTIONS default actions} and actions specified by the user
   * via {@link AdminBroOptions}
   *
   * @returns {Record<string, ActionDecorator>}
   */


  decorateActions() {
    // in the end we merge actions defined by the user with the default actions.
    // since _.merge is a deep merge it also overrides defaults with the parameters
    // specified by the user.
    const actions = _.merge({}, ACTIONS, this.options.actions || {});

    const returnActions = {}; // setting default values for actions

    Object.keys(actions).forEach(key => {
      actions[key].name = actions[key].name || key;
      actions[key].label = actions[key].label || key;
      returnActions[key] = new _actionDecorator.default({
        action: actions[key],
        admin: this._admin,
        resource: this._resource
      });
    });
    return returnActions;
  }
  /**
   * Initializes PropertyDecorator for all properties within a resource. When
   * user passess new property in the options - it will be created as well.
   *
   * @returns {Object<string,PropertyDecorator>}
   * @private
   */


  decorateProperties() {
    const resourceProperties = this._resource.properties(); // decorate all exising properties


    const properties = resourceProperties.reduce((memo, property) => {
      const decorator = new _propertyDecorator.default({
        property,
        admin: this._admin,
        options: this.options.properties && this.options.properties[property.name()],
        resource: this
      });
      return { ...memo,
        [property.name()]: decorator
      };
    }, {});

    if (this.options.properties) {
      // decorate all properties user gave in options but they don't exist in the resource
      Object.keys(this.options.properties).forEach(key => {
        if (!properties[key] && !key.match(/\./)) {
          const property = new _baseProperty.default({
            path: key,
            isSortable: false
          });
          properties[key] = new _propertyDecorator.default({
            property,
            admin: this._admin,
            options: this.options.properties && this.options.properties[key],
            resource: this
          });
        }
      });
    }

    return properties;
  }
  /**
   * Returns the name for the resource.
   * @return {string} resource name
   */


  getResourceName() {
    return this.options.name || this._resource.name();
  }
  /**
   * Returns resource parent along with the icon. By default it is a
   * database type with its icon
   * @return {Record<string,string>} returns { name, icon }
   */


  getParent() {
    const parent = this.options.parent || this._resource.databaseName();

    const name = parent.name || parent;
    const icon = parent.icon ? parent.icon : `icon-${this._resource.databaseType() || 'database'}`;
    return {
      name,
      icon
    };
  }
  /**
   * Returns propertyDecordator by giving property path
   *
   * @param   {String}  propertyPath  property path
   *
   * @return  {PropertyDecorator}
   * @throws  {ConfigurationError} when there is no property for given key
   */


  getPropertyByKey(propertyPath) {
    const property = this.properties[propertyPath];

    if (!property) {
      throw new _configurationError.default(`there is no property by the name of '${propertyPath}' in resource ${this.getResourceName()}`, 'tutorial-04-customizing-resources.html');
    }

    return property;
  }
  /**
   * Returns list of all properties which will be visible in given place (where)
   *
   * @param   {Object}  options
   * @param   {String}  options.where   one of: 'list', 'show', 'edit', 'filter'
   * @param   {String}  [options.max]   maximum number of properites retunred where there are
   *                                    no overrides in the options
   *
   * @return {Array<PropertyDecorator>}
   */


  getProperties({
    where,
    max = 0
  }) {
    const whereProperties = `${where}Properties`; // like listProperties, viewProperties etc

    if (this.options[whereProperties] && this.options[whereProperties].length) {
      return this.options[whereProperties].map(this.getPropertyByKey);
    }

    const properties = Object.keys(this.properties).filter(key => this.properties[key].isVisible(where)).sort((key1, key2) => this.properties[key1].position() > this.properties[key2].position() ? 1 : -1).map(key => this.properties[key]);

    if (max) {
      return properties.slice(0, max);
    }

    return properties;
  }

  getListProperties() {
    return this.getProperties({
      where: _propertyJson.PropertyPlace.list,
      max: DEFAULT_MAX_COLUMNS_IN_LIST
    });
  }
  /**
   * List of all actions which should be invoked for entire resource and not
   * for a particular record
   *
   * @param {CurrentAdmin} currentAdmin   currently logged in admin user
   * @return  {Array<ActionDecorator>}     Actions assigned to resources
   */


  resourceActions(currentAdmin) {
    return Object.values(this.actions).filter(action => action.isResourceType() && action.isVisible(currentAdmin) && action.isAccessible(currentAdmin));
  }
  /**
   * List of all actions which should be invoked for given record and not
   * for an entire resource
   *
   * @param {CurrentAdmin} [currentAdmin]   currently logged in admin user
   * @return  {Array<ActionDecorator>}     Actions assigned to each record
   */


  recordActions(record, currentAdmin) {
    return Object.values(this.actions).filter(action => action.isRecordType() && action.isVisible(currentAdmin, record) && action.isAccessible(currentAdmin, record));
  }
  /**
   * Returns PropertyDecorator of a property which should be treaten as a title property.
   *
   * @return  {PropertyDecorator} PropertyDecorator of title property
   */


  titleProperty() {
    const properties = Object.values(this.properties);
    const titleProperty = properties.find(p => p.isTitle());
    return titleProperty || properties[0];
  }
  /**
   * Returns title for given record.
   *
   * For example: If given record has `name` property and this property has `isTitle` flag set in
   * options or by the Adapter - value for this property will be shown
   *
   * @param   {BaseRecord}  record
   *
   * @return  {String}      title of given record
   */


  titleOf(record) {
    return record.param(this.titleProperty().name());
  }
  /**
   * Returns JSON representation of a resource
   *
   * @param {CurrentAdmin} currentAdmin
   * @return  {ResourceJSON}
   */


  toJSON(currentAdmin) {
    return {
      id: this._resource.id(),
      name: this.getResourceName(),
      parent: this.getParent(),
      href: this.h.resourceActionUrl({
        resourceId: this._resource.id(),
        actionName: 'list'
      }),
      titleProperty: this.titleProperty().toJSON(),
      resourceActions: this.resourceActions(currentAdmin).map(ra => ra.toJSON()),
      listProperties: this.getProperties({
        where: _propertyJson.PropertyPlace.list,
        max: DEFAULT_MAX_COLUMNS_IN_LIST
      }).map(property => property.toJSON()),
      editProperties: this.getProperties({
        where: _propertyJson.PropertyPlace.edit
      }).map(property => property.toJSON()),
      showProperties: this.getProperties({
        where: _propertyJson.PropertyPlace.show
      }).map(property => property.toJSON()),
      filterProperties: this.getProperties({
        where: _propertyJson.PropertyPlace.filter
      }).map(property => property.toJSON())
    };
  }

}

var _default = ResourceDecorator;
exports.default = _default;