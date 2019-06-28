const fs =require('fs');
const util =require('util');
const chalk = require('chalk');
const mkdirp = require('mkdirp');

const writeFile = util.promisify(fs.writeFile);
const removeFile = util.promisify(fs.unlink);
const accessFile = util.promisify(fs.access);
const mkdirpPromise = util.promisify(mkdirp);

exports.writeFile = async (title, content, outputPath) => {
  try {
    const isExistPath = await accessFile(outputPath)
      .then(() => (true)).catch(() => (false));

    if (!isExistPath) {
      await mkdirpPromise(outputPath);
      console.log(chalk.yellow('Directory was created.'));
      console.log();
    }
    console.log("v;: ", `${outputPath}${title}.md`)

    await writeFile(`${outputPath}/${title}.md`, content);

    console.log(chalk.green('The file has been saved!'));
    return true;
  } catch(err) {
    throw err;
  }
};

exports.removeFile = async (title, outputPath) => {
  try {
    const fullPathFile = `${outputPath}/${title}.md`;
    const isExistFile = await accessFile(fullPathFile)
      .then(() => (true)).catch(() => (false));

    if (isExistFile) {
      await removeFile(fullPathFile);
    }

    console.log(chalk.green('Path/file was delete'));
    return true;
  } catch(err) {
    throw err;
  }
};

exports.namedFile = ({title, number, created_at}) => {
  function padZero(value, length, content = '0') {
    return value.toString().padStart(2, '0');
  };

  const createdAt = new Date(created_at);
  const year = createdAt.getFullYear();
  const month = padZero(createdAt.getMonth() + 1, 2);
  const date = padZero(createdAt.getDate(), 2);
  const hour = padZero(createdAt.getHours(), 2);
  const minute = padZero(createdAt.getMinutes(), 2);
  const second = padZero((createdAt.getSeconds()), 2);

  return `${year}${month}${date}_${hour}${minute}${second}_${number}_${title}`;
};

exports.formatPostDate = (sourceDate) => {
  function padZero(value, length, content = '0') {
    return value.toString().padStart(2, '0');
  };

  const newDate = new Date(sourceDate);
  const year = newDate.getFullYear();
  const month = padZero(newDate.getMonth() + 1, 2);
  const date = padZero(newDate.getDate(), 2);
  const hour = padZero(newDate.getHours(), 2);
  const minute = padZero(newDate.getMinutes(), 2);
  const second = padZero((newDate.getSeconds()), 2);

  return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
}

// ↓ 找字串中少 alt 和 src
// src=\"[a-zA-Z0-9:\/\-\.]+"|alt=\"[\W0-9]+\"
