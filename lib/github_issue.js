import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'url';
import chalk from 'chalk';

import {
  writeMarkdownFile,
  removeMarkdownFile,
  namedFile,
  formatPostDate,
} from './utils.js'; // eslint-disable-line import/extensions

const GITHUB_BASE_API = 'https://api.github.com';
const NOW = Date.now();
const TEN_MINUTES = 1000 * 60 * 10;

async function refresh(username, repoName, gitToken, publishLabel, outputPath) {
  const PUBLISHED_LABEL = publishLabel;
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
      Authorization: `token ${gitToken}`,
      Accept: 'application/vnd.github.v3+json',
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

      // eslint-disable-next-line no-console
      console.log(`New files: ${newFiles.length}; Remove files: ${removeFiles.length}`);

      return true;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(`[Error][01][refresh] ${error}`);
    });
}

export default async (program) => {
  try {
    await Promise.resolve().then(() => {
      program
        .command('refresh')
        .option('-git, --git-service <gitService>', 'Specify git service', 'github')
        .option('-u, --username <username>', 'Specify git service', '')
        .option('-rep, --repository <repository>', 'Git repository', '')
        .option('--label <label>', 'Issue label', '')
        .option('-o, --output <output>', 'Output file path', './')
        .option('--git-token <gitToken>', 'Git token', '')
        .action((cmd) => {
          const {
            username, repository, gitToken, label, output,
          } = cmd;

          if (!username) {
            throw new Error('[Error][02] Must be setting username.');
          }
          if (!repository) {
            throw new Error('[Error][03] Must be setting repository name.');
          }
          if (!gitToken) {
            throw new Error('[Error][04] Must be setting git token.');
          }

          refresh(username, repository, gitToken, label, output);
        });
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(chalk.red(`[Error][05][Github Issue] ${error}`));
  }
};
