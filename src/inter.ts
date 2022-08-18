import { CompilerOptions, createProgram, isTypeAliasDeclaration } from 'typescript';
import { writeFileSync } from 'node:fs';

import { CompilerOptionsWithInter, InterOptions } from './inter.interface';

export class Inter {
  private readonly compilerOptions: CompilerOptions;
  private readonly options: InterOptions;

  public constructor(config: CompilerOptionsWithInter) {
    const {['ts-inter']: options, ...compilerOptions} = config;

    this.compilerOptions = compilerOptions;
    this.options = options;
  }

  public inferTypeExports(): string[] {
    const program = createProgram({rootNames: this.options.includes, options: this.compilerOptions});

    const checker = program.getTypeChecker();

    return program.getRootFileNames().flatMap((file) => {
      const sourceFile = program.getSourceFile(file);
      const symbolLoc = checker.getSymbolAtLocation(sourceFile);
      const moduleExports = checker.getExportsOfModule(symbolLoc);

      for (const moduleExport of moduleExports) {
        const declarations = moduleExport.getDeclarations();

        for (const declaration of declarations) {
          if (isTypeAliasDeclaration(declaration)) {

            const typeString = checker.typeToString(checker.getTypeAtLocation(declaration));

            const typeExport = `export type ${declaration.name.getText()} = ${typeString};`;

            return typeExport;
          }
        }
      }

      return [];
    });
  }

  public emitTypeExports(typeExports: string[]): void {
    const exportFileContent = typeExports.join('\n\n');
    writeFileSync(this.options.outFile, exportFileContent, {encoding: 'utf-8'});
  }
}