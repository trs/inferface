#!/usr/bin/env node

import { program } from 'commander';
import { Inferface } from "./main";

program
  .option(
    '--project <path>',
    'The path to the typescript configuration file, or to a folder with a \'tsconfig.json\'.',
    process.cwd()
  );

program.parse();

const {project} = program.opts<{project: string}>();

const options = Inferface.loadProjectConfigFile(project);

const inferer = new Inferface(options);
inferer.execute();
