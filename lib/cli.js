#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */

/* eslint-disable import/no-dynamic-require */

/* eslint-disable global-require */
"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _commander = _interopRequireDefault(require("commander"));

var _adminBro = _interopRequireDefault(require("./admin-bro"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pkg = JSON.parse(_fs.default.readFileSync(_path.default.join(__dirname, '../package.json'), 'utf-8'));

_commander.default.version(pkg.version);

_commander.default.command('bundle <configFile>').description(['Bundle all custom components addde by using AdminBro.bundle(filePath).', 'method. <configFile> argument is the path to your js file where you', 'export AdminBroOptions configuration object'].join('\n                     ')).action(configFile => {
  const config = require(_path.default.join(process.cwd(), configFile));

  if (!config.databases && !config.resources) {
    console.log(['Are you sure you pointed to the right configiration file?.', `'${_path.default.join(process.cwd(), configFile)}' does not have neither`, '"databases" nor "resources" properties.'].join('\n'));
    return;
  }

  const bundler = require('../lib/backend/bundler/user-components-bundler').default;

  bundler(new _adminBro.default(config), {
    watch: true,
    write: true
  });
});

_commander.default.parse(process.argv);