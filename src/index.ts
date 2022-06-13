import { generatorHandler, GeneratorOptions } from "@prisma/generator-helper";
import { PrismaSchemaTransform } from "./generator";
import { log } from "./utils/helper";
import { handleGenerateError } from "./error-handler";

export const GENERATOR_NAME = "Prisma Schema Transform";

generatorHandler({
  onManifest: () => ({
    prettyName: GENERATOR_NAME,
    requiresGenerators: ["prisma-client-js"],
  }),
  onGenerate: async (options: GeneratorOptions) => {
    try {
      await PrismaSchemaTransform.getInstance(options).run();
    } catch (e: any) {
      handleGenerateError(e);
      return;
    }
  },
});

log("Handler Registered.");
