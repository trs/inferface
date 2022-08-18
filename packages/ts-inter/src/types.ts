import { CompilerOptions } from "typescript";

export interface InterOptions {
  include: string[];
  outFile?: string;
  outDir?: string;
}

export type CompilerOptionsWithInter = {
  'ts-inter': InterOptions;
} & CompilerOptions;

export interface TypeExport {
  fileName: string;
  text: string;
}