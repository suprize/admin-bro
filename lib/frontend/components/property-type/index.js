"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _errorBoundary = _interopRequireDefault(require("../app/error-boundary"));

var _array = _interopRequireDefault(require("./array"));

var _mixed = _interopRequireDefault(require("./mixed"));

var _defaultType = _interopRequireDefault(require("./default-type"));

var _boolean = _interopRequireDefault(require("./boolean"));

var _datetime = _interopRequireDefault(require("./datetime"));

var _richtext = _interopRequireDefault(require("./richtext"));

var _reference = _interopRequireDefault(require("./reference"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

let globalAny = {};

try {
  globalAny = window;
} catch (error) {
  if (error.message !== 'window is not defined') {
    throw error;
  }
}

const types = {
  boolean: _boolean.default,
  datetime: _datetime.default,
  reference: _reference.default,
  date: _datetime.default,
  richtext: _richtext.default
};

/**
 * Component which renders properties in all the places in the AdminBro UI. By all the
 * places I mean:
 * - **list**: on the List,
 * - **edit**: on default actions where user can modify the record like: {@link EditAction},
 * and {@link NewAction},
 * - **show**: on the default {@link ShowAction} where user can see the details of a record,
 * - **filter**: and finally on the sidebar filter,
 *
 * Based on the type of given property and where the property is rendered **BasePropertyComponent**
 * picks Component to use. That is how **date** fields are rendered as **datepickers**
 * or **boolean** values as **checkbox**'es.
 *
 * You can override default behaviour by changing **components** param
 * for given property in **AdminBroOptions**. Take a look at the folowing example:
 *
 * ```
 * const AdminBro = require('admin-bro')
 * const ResourceModel = require('./resource-model')
 * const AdminBroOptions = {
 *   resources: [{
 *     resource: ResourceModel
 *     options: {
 *       properties: {
 *         name: {
 *           components: {
 *             show: AdminBro.bundle('./my-react-component'),
 *           },
 *         },
 *       },
 *     },
 *   }],
 * }
 * ```
 *
 * In the example above we are altering how **name** property will look
 * like on the {@link ShowAction}. When we will define **my-react-component.jsx** like this:
 *
 * ```
 * import React from 'react'
 * import PropertyInShow from 'admin-bro'
 *
 * const MyReactComponent = props => {
 *   const { record, property } = props
 *   const value = record.params[property.name] === 'foo' ? 'bar' : 'zoe'
 *   return (
 *     <PropertyInShow property={property}>
 *       {value}
 *     </PropertyInShow>
 *   )
 * }
 * ```
 *
 * When record value for given property (**name**) equals 'foo' we will reder 'bar', otherwise 'zoe'
 *
 * We also use {@link PropertyInShow} helper component to render field with a label that it looks
 * similar to alredy defined properties. For other places you can use
 * a different _wrapper components_:
 * - `edit`: {@link PropertyInEdit}
 * - `show`: {@link PropertyInShow}
 * - `filter`: {@link PropertyInFilter}
 * - `list`: doesn't have any special wrapper,
 *
 * In your components you have access to the following prop types:
 *
 * @component
 * @name BasePropertyComponent
 * @category Base
 * @example
 * const booleanProperty = {
 *   isTitle: false,
 *   name: 'awesome',
 *   isId: false,
 *   position: -1,
 *   label: 'I am awesome',
 *   type: 'boolean',
 * }
 *
 * const stringProperty = {
 *   isTitle: true,
 *   name: 'name',
 *   isId: false,
 *   position: -1,
 *   label: 'Name of a user',
 *   type: 'string',
 * }
 * // Resource is taken from the database
 * const resource = {
 *   id: 'User',
 *   name: 'User Model',
 *   titleProperty: 'name',
 *   resourceActions: [],
 *   listProperties: [booleanProperty, stringProperty],
 *   editProperties: [booleanProperty, stringProperty],
 *   showProperties: [booleanProperty, stringProperty],
 *   filterProperties: [booleanProperty, stringProperty],
 * }
 *
 * const record = {
 *   id: '1',
 *   title: 'John',
 *   params: {
 *     name: 'John',
 *     gender: 'male',
 *   },
 *   recordActions: [],
 * }
 *
 * return (
 *   <WrapperBox border>
 *     <BasePropertyComponent
 *       property={booleanProperty}
 *       resource={resource}
 *       where="edit"
 *       record={record}
 *     />
 *     <BasePropertyComponent
 *       property={stringProperty}
 *       resource={resource}
 *       where="edit"
 *       record={record}
 *     />
 *   </WrapperBox>
 * )
 */
class BasePropertyComponent extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      isClient: false
    };
  }

  componentDidMount() {
    this.setState({
      isClient: true
    });
  }

  render() {
    const {
      property,
      resource,
      record,
      filter,
      where,
      onChange
    } = this.props;
    const {
      isClient
    } = this.state;
    let Component = types[property.type] && types[property.type][where] || _defaultType.default[where];

    if (property.components && property.components[where] && isClient) {
      const component = property.components[where];

      if (!component) {
        throw new Error(`there is no "${property.name}.components.${where}"`);
      }

      Component = globalAny.AdminBro.UserComponents[component];
      return _react.default.createElement(_errorBoundary.default, null, _react.default.createElement(Component, {
        property: property,
        resource: resource,
        record: record,
        filter: filter,
        onChange: onChange
      }));
    }

    const Array = _array.default[where];
    const Mixed = _mixed.default[where];

    if (property.isArray) {
      if (!Array) {
        return _react.default.createElement("div", null);
      }

      return _react.default.createElement(Array, _extends({}, this.props, {
        ItemComponent: BasePropertyComponent
      }));
    }

    if (property.type === 'mixed' && property.subProperties && property.subProperties.length) {
      if (!Mixed) {
        return _react.default.createElement("div", null);
      }

      return _react.default.createElement(Mixed, _extends({}, this.props, {
        ItemComponent: BasePropertyComponent
      }));
    }

    return _react.default.createElement(_errorBoundary.default, null, _react.default.createElement(Component, {
      property: property,
      resource: resource,
      record: record,
      filter: filter,
      onChange: onChange
    }));
  }

}

exports.default = BasePropertyComponent;

function camelizePropertyType(type) {
  return {
    Edit: type.edit,
    Show: type.show,
    List: type.list,
    Filter: type.filter
  };
}

BasePropertyComponent.DefaultType = camelizePropertyType(_defaultType.default);
BasePropertyComponent.Boolean = camelizePropertyType(_boolean.default);
BasePropertyComponent.DateTime = camelizePropertyType(_datetime.default);
BasePropertyComponent.RichText = camelizePropertyType(_richtext.default);
BasePropertyComponent.Reference = camelizePropertyType(_reference.default);