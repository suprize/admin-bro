"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let globalAny = {};

try {
  globalAny = window;
} catch (error) {
  if (error.message !== 'window is not defined') {
    throw error;
  }
}

const checkLogin = response => {
  const loginUrl = [window.location.origin, globalAny.REDUX_STATE.paths.loginPath].join('');

  if (response.request.responseURL && response.request.responseURL.match(loginUrl)) {
    // eslint-disable-next-line no-undef
    alert('Your session expired. You will be redirected to login screen');
    window.location.assign(loginUrl);
  }
};
/**
 * Client which access the admin API.
 * Use it to fetch data from auto generated AdminBro API.
 *
 * In the backend it uses [axios](https://github.com/axios/axios) client
 * library.
 *
 * Usage:
 * ```javascript
 * import { ApiClient } from 'admin-bro'
 *
 * const api = new ApiClient()
 * api.getRecords({ resourceId: 'Comments' }).then(results => {...})
 * ```
 * @see https://github.com/axios/axios
 */


class ApiClient {
  constructor() {
    this.baseURL = [window.location.origin, globalAny.REDUX_STATE.paths.rootPath].join('');
    this.client = _axios.default.create({
      baseURL: this.baseURL
    });
  }
  /**
   * Search by query string for records in a given resource.
   *
   * @param   {Object}  options
   * @param   {String}  options.resourceId  Id of a {@link ResourceJSON}
   * @param   {String}  options.query       query string
   *
   * @return  {Promise<Array<SearchRecord>>}
   */


  async searchRecords({
    resourceId,
    query
  }) {
    const q = encodeURIComponent(query);
    const response = await this.client.get(`/api/resources/${resourceId}/search/${q}`);
    checkLogin(response);
    return response.data.records;
  }
  /**
   * Invokes given resource {@link Action} on the backend.
   *
   * @param   {Object} options
   * @param   {String} options.resourceId  id of a {@link BaseResource}
   * @param   {String} options.actionName  name of an {@link Action}
   * @param   {Object} [options.payload]   optional action payload
   * @param   {Object} [options.params]    optional query params
   * @param   {String} [options.method]    if there is a Payload it sends
   *                                       POST request, otherwise GET.
   * @return  {Promise<Object>}            response from an {@link Action}
   */


  async resourceAction({
    resourceId,
    actionName,
    payload,
    method,
    params
  }) {
    const response = await this.client.request({
      url: `/api/resources/${resourceId}/actions/${actionName}`,
      method: method || payload ? 'POST' : 'GET',
      data: payload,
      params
    });
    checkLogin(response);
    return response;
  }
  /**
   * Invokes given record {@link Action} on the backend.
   *
   * @param   {Object} options
   * @param   {String} options.resourceId  id of a {@link BaseResource}
   * @param   {String} options.recordId    id of a {@link BaseRecord}
   * @param   {String} options.actionName  name of an {@link Action}
   * @param   {Object} [options.payload]   optional action payload
   * @param   {Object} [options.params]    optional query params
   * @param   {String} [options.method]    if there is a Payload it sends
   *                                       POST request, otherwise GET.
   * @return  {Promise<Object>}            response from an {@link Action}
   */


  async recordAction({
    resourceId,
    recordId,
    actionName,
    payload,
    method,
    params
  }) {
    const response = await this.client.request({
      url: `/api/resources/${resourceId}/records/${recordId}/${actionName}`,
      method: method || payload ? 'POST' : 'GET',
      data: payload,
      params
    });
    checkLogin(response);
    return response;
  }

  async getDashboard({
    params = {}
  } = {}) {
    const response = await this.client.get('/api/dashboard', {
      params
    });
    checkLogin(response);
    return response;
  }

}

var _default = ApiClient;
exports.default = _default;