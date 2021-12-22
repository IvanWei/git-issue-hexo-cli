import {
  writeFile,
  unlink as removeFile,
  access as accessFile,
  mkdir,
} from 'fs/promises';
import chalk from 'chalk';

export const writeMarkdownFile = async (title, content, outputPath) => {
  try {
    const isExistPath = await accessFile(outputPath)
      .then(() => (true)).catch(() => (false));

    if (!isExistPath) {
      await mkdir(outputPath, { recursive: true });

      // eslint-disable-next-line no-console
      console.log(chalk.yellow('Directory was created.'));
      // eslint-disable-next-line no-console
      console.log();
    }

    await writeFile(`${outputPath}/${title}.md`, content);

    // eslint-disable-next-line no-console
    console.log(chalk.green('The file has been saved!'));
    return true;
  } catch (err) {
    return err;
  }
};

export const removeMarkdownFile = async (title, outputPath) => {
  try {
    const fullPathFile = `${outputPath}/${title}.md`;
    const isExistFile = await accessFile(fullPathFile)
      .then(() => (true)).catch(() => (false));

    if (isExistFile) {
      await removeFile(fullPathFile);
    }

    // eslint-disable-next-line no-console
    console.log(chalk.green('Path/file was delete'));
    return true;
  } catch (err) {
    return err;
  }
};

export const namedFile = ({ node_id, number, created_at }) => {
  function padZero(value, length) {
    return value.toString().padStart(length, '0');
  }

  const createdAt = new Date(created_at);
  const year = createdAt.getFullYear();
  const month = padZero(createdAt.getMonth() + 1, 2);
  const date = padZero(createdAt.getDate(), 2);
  // const hour = padZero(createdAt.getHours(), 2);
  // const minute = padZero(createdAt.getMinutes(), 2);
  // const second = padZero((createdAt.getSeconds()), 2);

  return `${year}-${month}-${date}-${number}-${node_id.toLowerCase()}`;
};

export const formatPostDate = (sourceDate) => {
  function padZero(value, length) {
    return value.toString().padStart(length, '0');
  }

  const newDate = new Date(sourceDate);
  const year = newDate.getFullYear();
  const month = padZero(newDate.getMonth() + 1, 2);
  const date = padZero(newDate.getDate(), 2);
  const hour = padZero(newDate.getHours(), 2);
  const minute = padZero(newDate.getMinutes(), 2);
  const second = padZero((newDate.getSeconds()), 2);

  return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
};

// ↓ 找字串中少 alt 和 src
// src=\"[a-zA-Z0-9:\/\-\.]+"|alt=\"[\W0-9]+\"
