#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const program = require('commander');

fs.readdirSync(__dirname).filter((file) => {
  return file !== 'index.js';
}).forEach((file) => {
  require(path.join(__dirname, file)).call(this, program, chalk, fs, path);
});

program.parse(process.argv);
