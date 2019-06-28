const fetch = require('node-fetch');
const {URL, URLSearchParams} = require('url');

const {writeFile, removeFile, namedFile} = require('../utils');

const GITHUB_BASE_API = 'https://api.github.com';
const NOW = Date.now();
const TEN_MINUTES = 1000 * 60 * 60 * 10;

function refresh (username, repoName, gitToken, label, outputPath) {
  const PUBLISHED_LABEL = label;
  const issueByRepoURL = new URL(`${GITHUB_BASE_API}/repos/${username}/${repoName}/issues`);
  issueByRepoURL.search = new URLSearchParams({
    state: 'all',
    sort: 'updated',
    since: new Date(NOW - TEN_MINUTES).toISOString(),
  });

  fetch(issueByRepoURL, {
    method: 'GET',
    headers: {
      'Authorization': `token ${gitToken}`,
    },
  })
  .then(async (res) => {
    const result = await res.json();

    if (res.status !== 200) {
      throw new Error(result.message);
    }

    const newFiles = result.filter((issue) => {
      const isOpen = issue.state === 'open';
      const isPublished = !!(issue.labels.find((label) => (label.name === PUBLISHED_LABEL)));

      return (isOpen && isPublished);

    }).map((issue) => {
      const newFilename = namedFile(issue);

      return writeFile(newFilename, issue.body, outputPath);
    });

    await Promise.all(newFiles);

    const removeFiles = result.filter((issue) => {
      const isClosed = issue.state !== 'open';
      const isUnPublished = !(issue.labels.find((label) => (label.name === PUBLISHED_LABEL)));

      return (isClosed || isUnPublished);

    }).map((issue) => {
      const filename = namedFile(issue);

      return removeFile(filename, outputPath);
    });

    await Promise.all(removeFiles);

    console.log(`New files: ${newFiles.length}; Remove files: ${removeFiles.length}`);

    return true;
  })
  .catch((err) => {
    console.error('error:: ', err);
  });
}

module.exports = (program, chalk, fs, path) => {
  program
    .command('refresh')
    .option('-G, --git-service <gitService>', 'Specify git service', 'github')
    .option('-u, --username <username>', 'Specify git service', '')
    .option('-R, --repository <repository>', 'Git repository', '')
    .option('-l, --label <label>', 'Issue label', '')
    .option('-o, --output <output>', 'Output file path', './')
    .option('--git-token <gitToken>', 'Git token', '')
    .action((cmd) => {
      const {gitService, username, repository, gitToken, label, output} = cmd;
      if (!username) {
        console.log(chalk.red('[Error] Must be setting username.'));
        return false;
      }
      if (!repository) {
        console.log(chalk.red('[Error] Must be setting repository name.'));
        return false;
      }
      if (!gitToken) {
        console.log(chalk.red('[Error] Must be setting git token.'));
        return false;
      }

      refresh(username, repository, gitToken, label, output);
    })
}
