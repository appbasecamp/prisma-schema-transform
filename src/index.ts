import * as fs from 'fs';
import { formatSchema } from '@prisma/sdk';
import { camelCase } from 'change-case';

export const GENERATOR_NAME = 'Transform Prisma Schema';

/**
 *
 * @param schemaPath Path to the Prisma schema file
 */
export async function fixPrismaFile(schemaPath: string) {
	const schema = fs.readFileSync(schemaPath, 'utf-8');

	const textAsArray = schema.split('\n');

    const fixedText = [];
    let currentModelName: string | null = null;
    let currentEnumName: string | null = null;
    let hasAddedModelMap = false;

    for (const line of textAsArray) {
      // Are we at the start of a model definition
      const modelMatch = line.match(/^model (\w+) {$/);
      if (modelMatch) {
        currentModelName = modelMatch[1];
        hasAddedModelMap = false;
        const pascalModelName = this.fixModelName(currentModelName);
        fixedText.push(`model ${pascalModelName} {`);
        continue;
      }

      // We don't need to change anything if we aren't in a model body
      if (!currentModelName) {
        fixedText.push(line);
        continue;
      }

      // Add the @@map to the table name for the model
      if (!hasAddedModelMap && (line.match(/\s+@@/) || line === '}')) {
        if (line === '}') {
          fixedText.push('');
        }
        // fixedText.push(`  @@map("${currentModelName}")`)
        this.pushIfnotExist(
          fixedText,
          textAsArray,
          `  @@map("${currentModelName}")`,
        );
        hasAddedModelMap = true;
      }

      // Are we at the start of a enum definition
      const enumMatch = line.match(/^enum (\w+) {$/);
      if (enumMatch) {
        currentEnumName = enumMatch[1];
        const pascalEnumName = this.fixEnumName(currentEnumName);
        fixedText.push(`enum ${pascalEnumName} {`);
        continue;
      }

      // Renames field and applies a @map to the field name if it is snake case
      // Adds an s to the field name if the type is an array relation
      const fieldMatch = line.match(/\s\s(\w+)\s+(\w+)(\[\])?/);
      let fixedLine = line;
      if (fieldMatch) {
        const [, currentFieldName, currentFieldType] = fieldMatch;

        const fixedFieldName = camelCase(currentFieldName);

        fixedLine = fixedLine.replace(currentFieldName, fixedFieldName);

        // Add map if we needed to convert the field name and the field is not a relational type
        // If it's relational, the field type will be a non-primitive, hence the isPrimitiveType check
        if (
          currentFieldName.includes('_') &&
          this.isPrimitiveType(currentFieldType)
        ) {
          fixedLine = `${fixedLine} @map("${currentFieldName}")`;
        }
      }

      // Capitalizes model names in field types
      const fieldTypeMatch = fixedLine.match(/\s\s\w+\s+(\w+)/);
      if (fieldTypeMatch) {
        const currentFieldType = fieldTypeMatch[1];
        const fieldTypeIndex = fieldTypeMatch[0].lastIndexOf(currentFieldType);
        const fixedFieldType = this.fixFieldTypeName(currentFieldType);
        const startOfLine = fixedLine.substr(0, fieldTypeIndex);
        const restOfLine = fixedLine.substr(
          fieldTypeIndex + currentFieldType.length,
        );
        fixedLine = `${startOfLine}${fixedFieldType}${restOfLine}`;
      }

      // Changes `fields: [relation_id]` in @relation to camel case
      const relationFieldsMatch = fixedLine.match(/fields:\s\[([\w,\s]+)\]/);
      if (relationFieldsMatch) {
        const fields = relationFieldsMatch[1];
        fixedLine = fixedLine.replace(
          `[${fields}]`,
          `[${this.fixFieldsArrayString(fields)}]`,
        );
      }

      // Changes @relation("something") to pascal case
      const relationNameMatch = fixedLine.match(/@relation\(\"([^"]*)\"/);
      if (relationNameMatch) {
        const relation = relationNameMatch[1];
        fixedLine = fixedLine.replace(relation, this.fixFieldName(relation));
      }

      // Changes fields listed in @@index or @@unique to camel case
      const indexUniqueFieldsMatch = fixedLine.match(/@@\w+\(\[([\w,\s]+)\]/);
      if (indexUniqueFieldsMatch) {
        const fields = indexUniqueFieldsMatch[1];
        fixedLine = fixedLine.replace(
          fields,
          this.fixFieldsArrayString(fields),
        );
      }

      fixedText.push(fixedLine);
    }

    fs.writeFileSync(
		this.prismaFilePath,
		await formatSchema({ schema: fixedText.join('\n') }),
	  );
}
