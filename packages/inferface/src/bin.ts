#!/usr/bin/env node

import { program } from 'commander';
import { Inferface } from "./main";

interface Options {
  project?: string;
  outfile?: string;
  outdir?: string;
};

// Setup program
program
  .name('inferface')
  .option(
    '--project <path>',
    'The path to the typescript configuration file, or to a folder with a \'tsconfig.json\'.',
    process.cwd()
  )
  .option(
    '--outfile'
  )
  .option(
    '--outdir'
  )
  .argument(
    '[...include]',
    'A glob-supported allowlist of files to include in the export.'
  )
  .parse();

// Resolve arguments
const {project, outdir, outfile} = program.opts<Options>();

const options = Inferface.loadProjectConfigFile(project);

if (!options.inferface)
  options.inferface = {include: []};

if (typeof outfile === 'string')
  options.inferface.outFile = outfile;

if (typeof outdir === 'string')
  options.inferface.outDir = outdir;

if (program.args.length > 0)
  options.inferface.include = program.args;

// Validate options
if (options.inferface.include.length === 0)
  throw new Error('Missing required \'include\' option.');

// Execute
const inferer = new Inferface(options);
inferer.execute();
