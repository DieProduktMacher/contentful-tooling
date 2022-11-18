import * as path from 'path';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { getStringDate } from '../../lib/helpers';

/**
 * Creates a new migration file. Automatically opens the migration file in the editor when run from
 * inside a VS Code terminal session.
 *
 * @param name The name of the new migration without timestamp
 * @param migrationsDirectory The foldet to create the directory in
 */
export const createMigration = async (
  name: string,
  migrationsDirectory: string,
) => {
  const filename = getStringDate() + '-' + name + '.ts';
  const filepath = path.join(migrationsDirectory, filename);
  const content = `import type { MigrationFunction } from "contentful-migration";

const m: MigrationFunction = (
  migration,
  { makeRequest, spaceId, accessToken }
) => {
  // TODO: Define migration here
};

export = m;
`;
  await writeFile(filepath, content);
  if (process.env.TERM_PROGRAM === 'vscode') {
    exec(`code "${filepath}"`);
  }
};
