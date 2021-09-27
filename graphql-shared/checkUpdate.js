#!/usr/bin/env node

const colors = require('colors');
const shell = require('shelljs');

const latestVersion = shell.exec('npm info @common-utils/graphql-shared version', { silent: true }).stdout;
const installedVersion = require('./package.json').version;

if (latestVersion.trim() !== installedVersion.trim()){
  console.log('\u274C graphql-shared is not the latest version, you should update!!!'.red.bold);
} else {
  console.log('\u2705 All good, you have the latest version of graphql-shared!'.green.bold);
}
