import { GeneratorOptions } from "@prisma/generator-helper";
import { parseEnvValue } from "@prisma/sdk";
import * as path from "path";
import * as prettier from "prettier";
import { FixPrismaFile } from "./fix-prisma-file";

export interface PrismaSchemaTransformConfig {
  fixPrismaFile: boolean;
  generateRest: boolean;
  generateGraphql: boolean;
  generateSocket: boolean;
  entityName: string;
}

export class PrismaSchemaTransform {
  static instance: PrismaSchemaTransform;
  _options: GeneratorOptions;
  _prettierOptions: prettier.Options | null;

  constructor(options?: GeneratorOptions) {
    if (options) {
      this.options = options;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const output = parseEnvValue(options?.generator.output!);
    this.prettierOptions =
      prettier.resolveConfig.sync(output, { useCache: false }) ||
      prettier.resolveConfig.sync(path.dirname(require?.main?.filename!), {
        useCache: false,
      });
  }

  public get options() {
    return this._options;
  }

  public set options(value) {
    this._options = value;
  }

  public get prettierOptions() {
    return this._prettierOptions;
  }

  public set prettierOptions(value) {
    this._prettierOptions = value;
  }

  static getInstance(options?: GeneratorOptions) {
    if (PrismaSchemaTransform.instance) {
      return PrismaSchemaTransform.instance;
    }
    PrismaSchemaTransform.instance = new PrismaSchemaTransform(options);
    return PrismaSchemaTransform.instance;
  }

  run = async (): Promise<void> => {
    await FixPrismaFile.getInstance(this.options.schemaPath).run();
    return;
  };
}
