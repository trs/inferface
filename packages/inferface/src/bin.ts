#!/usr/bin/env node

import { program } from 'commander';
import { resolve, join } from 'node:path';
import { statSync, readFileSync, writeFileSync } from 'node:fs';

import { Inferface } from "./main";

program
  .option(
    '--project <path>',
    'The path to the typescript configuration file, or to a folder with a \'tsconfig.json\'.',
    process.cwd()
  );

program.parse();

const {project} = program.opts<{project: string}>();

const projectPath = resolve(project);

const tsconfigPath = statSync(projectPath).isFile()
  ? projectPath
  : join(projectPath, 'tsconfig.json');

const options = JSON.parse(readFileSync(tsconfigPath, {encoding: 'utf-8'}));

const inferer = new Inferface(options);
const files = inferer.getInterfaceFiles();

let outFileText = '';
for (const file of files) {
  const types = inferer.inferTypeExports(file);
  if (typeof inferer.options.outDir === 'string') {
    for (const type of types) {
      writeFileSync(join(inferer.options.outDir, type.fileName), type.text, {encoding: 'utf-8'});
    }
  }

  if (typeof inferer.options.outFile === 'string') {
    outFileText += types.map(({text}) => text).join('\n') + '\n\n';
  }
}

if (outFileText) {
  writeFileSync(inferer.options.outFile, outFileText, {encoding: 'utf-8'});
}