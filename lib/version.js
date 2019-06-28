const {version} = require('../package.json');

module.exports = (program) => {
  program
    .version(`Current version: ${version}`, '-v, --version');
};
