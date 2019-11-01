"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

const generateUserComponentEntry = (admin, entryPath) => {
  const {
    env = {}
  } = admin.options;
  const {
    UserComponents
  } = admin.constructor;

  const absoluteEntryPath = _path.posix.resolve(entryPath);

  const setupPart = 'AdminBro.UserComponents = {}\n';
  const envPart = Object.keys(env).map(envKey => `AdminBro.env.${envKey} = ${JSON.stringify(env[envKey])}\n`).join('');
  const componentsPart = Object.keys(UserComponents).map(componentId => [`import ${componentId} from '${_path.posix.relative(absoluteEntryPath, UserComponents[componentId])}'`, `AdminBro.UserComponents.${componentId} = ${componentId}`].join('\n')).join('\n');
  return setupPart + envPart + componentsPart;
};

var _default = generateUserComponentEntry;
exports.default = _default;