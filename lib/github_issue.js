import fetch from 'node-fetch';
import {URL, URLSearchParams} from 'url';

import {
  writeMarkdownFile,
  removeMarkdownFile,
  namedFile,
  formatPostDate,
} from '../utils.js';

const GITHUB_BASE_API = 'https://api.github.com';
const NOW = Date.now();
const TEN_MINUTES = 1000 * 60 * 10;
 
async function refresh (username, repoName, gitToken, label, outputPath) {
  const PUBLISHED_LABEL = label;
  const issueByRepoURL = new URL(`${GITHUB_BASE_API}/repos/${username}/${repoName}/issues`);
  issueByRepoURL.search = new URLSearchParams({
    state: 'all',
    sort: 'updated',
    labels: PUBLISHED_LABEL,
    since: new Date(NOW - TEN_MINUTES).toISOString(),
  });

  fetch(issueByRepoURL, {
    method: 'GET',
    headers: {
      'Authorization': `token ${gitToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  })
  .then(async (res) => {
    const result = await res.json();

    if (res.status !== 200) {
      throw new Error(result.message);
    }

    const newFiles = result
      .filter((issue) => {
        const isOpen = issue.state === 'open';
        const isPublished = !!(issue.labels.find((label) => (label.name === PUBLISHED_LABEL)));

        return (isOpen && isPublished);
      })
      .map((issue) => {
        const newFilename = namedFile(issue);
        const labels = issue.labels
          .filter((label) => (label.name !== PUBLISHED_LABEL))
          .map((label) => (label.name), []);

        let content = issue.body;
        content = content.replace(/{title}/g, issue.title);
        content = content.replace(/{createdAt}/g, formatPostDate(issue.created_at));
        content = content.replace(/{updatedAt}/g, formatPostDate(issue.updated_at));
        content = content.replace(/{labels}/g, JSON.stringify(labels).replace(/"/g, ''));

        return writeMarkdownFile(newFilename, content, outputPath);
      });

    await Promise.all(newFiles);

    const removeFiles = result
      .filter((issue) => {
        const isClosed = issue.state !== 'open';
        const isUnPublished = !!(issue.labels.find((label) => (label.name !== PUBLISHED_LABEL)));

        return (isClosed || isUnPublished);
      })
      .map((issue) => {
        const filename = namedFile(issue);

        return removeMarkdownFile(filename, outputPath);
      });

    await Promise.all(removeFiles);

    console.log(`New files: ${newFiles.length}; Remove files: ${removeFiles.length}`);

    return true;
  })
  .catch((error) => {
    console.error(`[Error][refresh] ${error}`);
  });
}

export default async (program, chalk, fs, path) => {
  try {
    await Promise.resolve().then(() => {
      program
      .command('refresh')
      .option('-git, --git-service <gitService>', 'Specify git service', 'github')
      .option('-u, --username <username>', 'Specify git service', '')
      .option('-rep, --repository <repository>', 'Git repository', '')
      .option('--label <label>', 'Issue label', '')
      .option('-o, --output <output>', 'Output file path', './test')
      .option('--git-token <gitToken>', 'Git token', '')
      .action(async (cmd) => {
        const {gitService, username, repository, gitToken, label, output} = cmd;
        if (!username) {
          console.error(chalk.red('[Error] Must be setting username.'));
          return false;
        }
        if (!repository) {
          console.error(chalk.red('[Error] Must be setting repository name.'));
          return false;
        }
        if (!gitToken) {
          console.error(chalk.red('[Error] Must be setting git token.'));
          return false;
        }

        await refresh(username, repository, gitToken, label, output);
      });
    });
  } catch (error) {
    console.error(chalk.red(`[Error][Github Issue] ${error}`));
  }
}
