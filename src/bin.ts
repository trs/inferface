#!/usr/bin/env node

import { program } from 'commander';
import { resolve, join } from 'node:path';
import { statSync, readFileSync } from 'node:fs';

import { Inter } from "./inter";

program
  .option(
    '--project <path>',
    'The path to the typescript configuration file, or to a folder with a \'tsconfig.json\'.',
    `${__dirname}`
  );

program.parse();

const {project} = program.opts<{project: string}>();

const projectPath = resolve(project);

const tsconfigPath = statSync(projectPath).isFile()
  ? projectPath
  : join(projectPath, 'tsconfig.json')

console.log('tsconfigPath', tsconfigPath);

const options = JSON.parse(readFileSync(tsconfigPath, {encoding: 'utf-8'}));

const inter = new Inter(options);

const types = inter.inferTypeExports();

inter.emitTypeExports(types);