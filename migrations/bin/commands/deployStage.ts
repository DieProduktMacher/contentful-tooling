import type { Space } from 'contentful-management';
import { MigrationRunner } from '../../lib/migrationRunner';

export const deployStage = async (
  space: Space,
  accessToken: string,
  migrationsDirectory: string,
) => {
  // Check if 'stage' already exists
  const environments = await space.getEnvironments();

  const stage = environments.items.find(({ name }) => name === 'stage');
  
  if (!stage) {
    console.log(
      `Environment 'stage' does not exist. Creating 'stage' from current master....`,
    );

    await space.createEnvironmentWithId('stage', { name: 'stage' }, 'master');
  }

  // Get 'stage' and run all new migrations
  const environment = await space.getEnvironment('stage');

  const migrationRunner = new MigrationRunner(
    space,
    environment,
    accessToken,
    migrationsDirectory,
  );
  await migrationRunner.runAllNewMigrations();
};
