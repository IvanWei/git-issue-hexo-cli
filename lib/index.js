#!/usr/bin/env node

import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';

// eslint-disable-next-line import/extensions
import { Command } from 'commander/esm.mjs';

const DIRNAME = resolve(fileURLToPath(import.meta.url), '../');

(async function init() {
  try {
    const program = new Command();
    const fileList = await readdir(DIRNAME);

    const contents = await Promise.all(fileList
      .filter((file) => (file !== 'index.js'))
      .map(async (file) => import(resolve(DIRNAME, file))));

    await Promise.all(contents.map((content) => content.default(program)));

    await program.parseAsync(process.argv);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[Error] ${error}`);
  }
}());
