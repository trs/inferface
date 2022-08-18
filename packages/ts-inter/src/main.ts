import { createProgram, isTypeAliasDeclaration, Program, TypeChecker } from 'typescript';
import { basename } from 'node:path';
import glob from 'fast-glob';

import { CompilerOptionsWithInter, InterOptions, TypeExport } from './types';

export class TypescriptInferer {
  public readonly options: InterOptions;

  private readonly program: Program;
  private readonly checker: TypeChecker;

  public constructor(config: CompilerOptionsWithInter) {
    const {['ts-inter']: options, ...compilerOptions} = config;
    this.options = options;

    const rootNames = glob.sync(this.options.include);

    this.program = createProgram({rootNames, options: compilerOptions});
    this.checker = this.program.getTypeChecker();
  }

  public getInterfaceFiles(): readonly string[] {
    return this.program.getRootFileNames();
  }

  public inferTypeExports(file: string): TypeExport[] {
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
}