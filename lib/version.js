import {readFile} from 'fs/promises';

export default async (program) => {
  const packageContent = await readFile(new URL('../package.json', import.meta.url))

  await Promise.resolve().then(() => {
    const {version} = JSON.parse(packageContent);
    program
      .version(`v${version}`, '-v, --version');
  });
};
