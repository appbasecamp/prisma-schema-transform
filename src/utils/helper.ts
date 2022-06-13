import { logger } from '@prisma/sdk';
import * as path from 'path';
import * as fs from 'fs';
import * as pluralize from 'pluralize';
import { GENERATOR_NAME } from '../index';
import { GeneratorFormatNotValidError } from '../error-handler';
import { DMMF } from '@prisma/generator-helper';
import { Options, format } from 'prettier';
import { pascalCase } from 'change-case';

export const capitalizeFirst = (src: string) => {
  return src.charAt(0).toUpperCase() + src.slice(1);
};

export const getRelativeTSPath = (from: string, to: string): string => {
  let rel = path
    .relative(path.resolve(path.dirname(from)), to)
    .replace('.ts', '');
  if (path.dirname(from) === path.dirname(to)) {
    rel = `./${rel}`;
  }
  return rel;
};

export const uniquify = (src: any[]): any[] => {
  return [...new Set(src)];
};

export const arrayify = (src: string): string => {
  return src + '[]';
};

export const singularize = (string: string): string => {
  return pluralize.singular(string);
};

export const wrapArrowFunction = (field: DMMF.Field): string => {
  if (typeof field.type !== 'string') {
    return `() => unknown`;
  }
  return `() => ${pascalCase(field.type)}Entity`;
};

export const wrapQuote = (field: DMMF.Field): string => {
  if (typeof field.type !== 'string') {
    return `'unknown'`;
  }
  return `'${field.type}'`;
};

export const log = (src: string) => {
  logger.info(`[${GENERATOR_NAME}]:${src}`);
};

export const parseBoolean = (value: unknown): boolean => {
  if (['true', 'false'].includes(value.toString()) === false) {
    throw new GeneratorFormatNotValidError('parseBoolean failed');
  }
  return value.toString() === 'true';
};

export const toArray = <T>(value: T | T[]): T[] => {
  return Array.isArray(value) ? value : [value];
};

export const writeTSFile = (fullPath: string, content: string) => {
  log(`Generate ${fullPath}`);
  const dirname = path.dirname(fullPath);
  if (fs.existsSync(dirname) === false) {
    fs.mkdirSync(dirname, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
};

export const prettierFormat = (content: string, options: Options = {}) => {
  return format(content, { ...options, parser: 'typescript' });
};

export const isNumeric = (str: any) => {
  if (typeof str != 'string') return false; // we only process strings!
  return !isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
};

export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

export const replaceAll = (str: string, find: string, replace: any): string => {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
};
