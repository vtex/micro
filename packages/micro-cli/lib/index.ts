#!/usr/bin/env node
import chalk from 'chalk';
import {
  CommandNotFoundError,
  find,
  MissingRequiredArgsError,
  run as unboundRun
} from 'findhelp';
import { join } from 'path';

import { tree } from './modules/tree';

const run = (command: any) => unboundRun.call(tree, command, join(__dirname, 'modules'));

const main = async () => {
  try {
    console.log('🦄 Welcome to Micro');
    const args = process.argv.slice(2);
    await run(find(tree, args));
  } catch (e) {
    switch (e.name) {
      case MissingRequiredArgsError.name:
        console.error('Missing required arguments:', chalk.blue(e.message));
        break;
      case CommandNotFoundError.name:
        console.error('Command not found:', chalk.blue(...process.argv.slice(2)));
        break;
      default:
        console.error(chalk.red('💣 Something exploded:\n'), e);
    }
  }
};

main();
