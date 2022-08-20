# `inferface`

Emit the result of inferred types, useful for exposing Typescript API interfaces to consumers.

## Why?

If you have an inferred type that you want to export and expose but do not want the consumer
to have to also require the library that was used to create the type, then use this.

This library will use the Typescript type checker to resolve the type and write the resolved
type to a file. This file can then be used by the consumer instead, which only contains raw
typescript.

## Install

```sh
npm install --save-dev inferface
```

```sh
yarn add --dev inferface
```

## Usage

```sh
inferface [--project <path>] [--outfile <file>] [--outdir <dir>] [...include]

# Looks for a tsconfig.json in the cwd
inferface

# Specify a different path to a tsconfig.json
inferface --project ../tsconfig.build.json

# Export types for given paths
inferface src/**/*.dto.ts src/**/*.api.ts

# Change output directory
inferface --outdir dist/interface

# Change output file
inferface --outfile dist/interface/index.ts
```

## Configuration

Besides the command line options, `inferface` can be configured using a `tsconfig.json`.

By default the `tsconfig.json` will be searched for in the cwd, but this can be changed
with the `--project` option.

Add a `inferface` property at the root of the `tsconfig.json` file with at least `include`
and one of `outDir` or `outFile`.

```jsonc
{
  "compilerOptions": {},
  "inferface": {
    "include": [
      "./src/**/*.dto.ts"
    ],
    "outDir": "./dist/interface"
  }
}
```