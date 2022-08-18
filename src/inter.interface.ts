import { CompilerOptions } from "typescript";

export interface InterOptions {
  include: string[];
  outFile: string;
}

export type CompilerOptionsWithInter = {
  "ts-inter": InterOptions;
} & CompilerOptions;