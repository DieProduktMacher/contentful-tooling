import type { Space } from 'contentful-management';
import { makeTimestampedEnvironment } from '../../lib/helpers';
import { MigrationRunner } from '../../lib/migrationRunner';
import { generateTypeDefinitions } from '../../lib/typeDefinitionGenerator';

export const ciTestMigrations = async (
  space: Space,
  accessToken: string,
  migrationsDirectory: string,
  options: {
    generateTypeDefinitions: boolean;
    keepEnvironment: boolean;
    typeGeneratorOutputFile: string;
  },
) => {
  const environment = await makeTimestampedEnvironment(space, 'ci');

  try {
    const migrationRunner = new MigrationRunner(
      space,
      environment,
      accessToken,
      migrationsDirectory,
    );
    await migrationRunner.runAllNewMigrations();

    if (options.generateTypeDefinitions) {
      await generateTypeDefinitions(
        environment,
        options.typeGeneratorOutputFile,
      );
    }
  } catch (e) {
    console.log(
      'An error occurred while trying to run migrations. Cleaning up by deleting the failed CI environment',
    );
    throw e;
  }

  if (!options.keepEnvironment) {
    console.log(`Deleting environment '${environment.sys.id}'`);
    await environment.delete();
    console.log(`Environment '${environment.sys.id}' deleted successfully`);
  }
};
