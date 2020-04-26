import { existsSync } from 'fs';
import * as core from '@actions/core'
import * as github from '@actions/github'
import lint from '@commitlint/lint'
import load from '@commitlint/load'
import cconfig from '@commitlint/config-conventional';

async function run(): Promise<void> {
  try {
    const configPath = core.getInput('configuration-path', {required: true})
    const title = getPrTitle()
    if (!title) {
      core.debug('Could not get pull request title from context, exiting')
      return
    }
    await lintPullRequest(title)
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

function getPrTitle(): string | undefined {
  const pullRequest = github.context.payload.pull_request
  if (!pullRequest) {
    return undefined
  }
  console.log('PR Title', pullRequest.title);
  return pullRequest.title
}

export async function lintPullRequest(title: string) {
  console.log('title', title);
  console.log('default @commitlint/config-conventional', cconfig);
  let opts: any = {};
  try {
    // let opts = await load({
    //   extends: ['@commitlint/config-conventional'],
    //   rules: {
    //     'references-empty': [2, 'never'],
    //   },
    //   parserPreset: {
    //     parserOpts: {
    //       issuePrefixes: ['SET-'],
    //     },
    //   },
    // },
    //   {
    //     cwd: process.cwd()
    //   });
    // console.log('opts', opts);
    const result = await lint(
      title,
      {
        'references-empty': [2, 'never'],
      },
      {
        issuePrefixes: ['SET-'],
      }
    );
    console.log('result', result);
    if (result.valid === true) {
      return;
    } else {
      const errorMessage = result.errors
        .map(({message, name}: any) => `${name}:${message}`)
        .join('\n');
      console.error(errorMessage);
      core.setFailed(errorMessage);
    }
  } catch (e) {
    console.log('in catch');
    core.error(e);
    core.setFailed(e.message);
  }
}

run()
