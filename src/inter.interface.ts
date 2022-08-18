import { CompilerOptions } from "typescript";

export interface InterOptions {
  includes: string[];
  outFile: string;
}

export type CompilerOptionsWithInter = {
  "ts-inter": InterOptions;
} & CompilerOptions;