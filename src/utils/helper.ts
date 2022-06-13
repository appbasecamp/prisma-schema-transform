import { logger } from "@prisma/sdk";
import * as path from "path";
import * as fs from "fs";
import * as pluralize from "pluralize";
import { GENERATOR_NAME } from "../index";
import { GeneratorFormatNotValidError } from "../error-handler";
import { DMMF } from "@prisma/generator-helper";
import { Options, format } from "prettier";
import { pascalCase } from "change-case";

export const singularize = (string: string): string => {
  return pluralize.singular(string);
};

export const log = (src: string) => {
  logger.info(`[${GENERATOR_NAME}]:${src}`);
};

export const prettierFormat = (content: string, options: Options = {}) => {
  return format(content, { ...options, parser: "typescript" });
};
