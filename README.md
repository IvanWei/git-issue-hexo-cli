# Blog content source CLI

## What is this

Get content by issue on Git service, then transfer to Markdown file.

### Support

- [x] Github
- [ ] Bitbucket
- [ ] GitLab

## Install

> $ yarn add @ivanwei/blog-content-source-cli

## How do use

### Get current version

> $ b.content --version

### Refresh contents

> $ git-issue-hexo-cli refresh <options>

| Option | Required | Default | Description |
|---|---|---|---|
| -git, --git-service \<gitService\> | | github | Choose git service |
| -u, --username \<username\> | ✔ | | Username or user's id on git service |
| -rep, --repository <repository> | ✔ | | Repository's name |
| --label <label> | | | |
| -o, --output <output> | ./ | | 輸出時的資料夾 |
| --git-token <gitToken> | ✔ | | Git service's token |

**Option "-G" is finish yet.**
