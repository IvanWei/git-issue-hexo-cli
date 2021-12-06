#!/usr/bin/env node

import fs from 'fs';
import path, {resolve} from 'path';
import {fileURLToPath} from 'url';
import {readdir} from 'fs/promises';

import chalk from 'chalk';
import {Command} from 'commander/esm.mjs';

const __dirname = resolve(fileURLToPath(import.meta.url), '../');

(async function () {
  try {
    const program = new Command();
    const fileList = await readdir(__dirname);

    const contents = await Promise.all(fileList
      .filter((file) => (file !== 'index.js'))
      .map(async (file) => {
        return import(resolve(__dirname, file));
      }));

    await Promise.all(contents.map((content) => {
      return content.default(program, chalk, fs, path);
    }));

    await program.parseAsync(process.argv);

  } catch (error) {
    console.log('111:: ', error)
  }
})();
