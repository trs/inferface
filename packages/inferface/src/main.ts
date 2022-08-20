import { createProgram, findConfigFile, readConfigFile, isTypeAliasDeclaration, Program, TypeChecker, factory } from 'typescript';
import { basename, resolve, join, dirname } from 'node:path';
import { statSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import glob from 'fast-glob';

import { InferfaceCompilerOptions, InferfaceOptions, InferfaceExport } from './types';

export class Inferface {
  private readonly options: InferfaceOptions;
  private readonly program: Program;
  private readonly checker: TypeChecker;
  private readonly files: readonly string[];

  public constructor(config: InferfaceCompilerOptions) {
    const {inferface: options, ...compilerOptions} = config;
    this.options = {
      ...options,
      outDir: options.outDir ? resolve(options.outDir) : undefined,
      outFile: options.outFile ? resolve(options.outFile) : undefined
    };

    const rootNames = glob.sync(this.options.include);

    this.program = createProgram({rootNames, options: compilerOptions});
    this.checker = this.program.getTypeChecker();
    this.files = this.program.getRootFileNames();
  }

  public static loadProjectConfigFile(path: string): InferfaceCompilerOptions {
    const projectPath = dirname(resolve(path));
    const configFilePath = findConfigFile(projectPath, (file) => statSync(file).isFile());

    const configFileContents = readConfigFile(configFilePath, (file) => readFileSync(file, { encoding: 'utf-8' }));
    if (configFileContents.error) throw new Error(configFileContents.error.messageText.toString());

    return configFileContents.config;
  }

  public execute() {
    this.files
      .map(this.inferTypeExports.bind(this))
      .forEach(this.writeTypeExports.bind(this));
  }

  public inferTypeExports(file: string): InferfaceExport[] {
    const sourceFile = this.program.getSourceFile(file);
    const symbolLoc = this.checker.getSymbolAtLocation(sourceFile);
    const moduleExports = this.checker.getExportsOfModule(symbolLoc);

    return moduleExports.flatMap((moduleExport) => {
      const declarations = moduleExport.getDeclarations();

      return declarations.filter(isTypeAliasDeclaration).map((declaration) => {
        const typeString = this.checker.typeToString(this.checker.getTypeAtLocation(declaration));

        const text = `export type ${declaration.name.getText()} = ${typeString};`;

        return {
          fileName: basename(sourceFile.fileName),
          text
        };
      });
    });
  }

  public writeTypeExports(typeExports: InferfaceExport[], index?: number) {
    if (typeof this.options.outDir === 'string') {
      mkdirSync(this.options.outDir, {recursive: true});

      for (const type of typeExports) {
        writeFileSync(join(this.options.outDir, type.fileName), type.text, {encoding: 'utf-8'});
      }
    }

    if (typeof this.options.outFile === 'string') {
      if (index === 0) {
        mkdirSync(dirname(this.options.outFile), {recursive: true});
      }

      const text = typeExports.map(({text}) => text).join('\n') + (index < this.files.length - 1 ? '\n\n' : '');
      const writeMethod = index === 0 ? writeFileSync : appendFileSync;
      writeMethod(this.options.outFile, text, {encoding: 'utf-8'});
    }
  }
}