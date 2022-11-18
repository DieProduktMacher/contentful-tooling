import type { Environment, Space } from 'contentful-management';
import { makeTimestampedEnvironment } from '../../lib/helpers';
import { MigrationRunner } from '../../lib/migrationRunner';

// TODO: Double vs tripe '=' string comparison
const sortEnvironmentIdDescending = (a: Environment, b: Environment) =>
  b.sys.id > a.sys.id ? 1 : b.sys.id == a.sys.id ? 0 : -1;

export const deployProd = async (
  space: Space,
  accessToken: string,
  migrationsDirectory: string,
  numberOfBackupsToKeep: number = 1,
) => {
  const oldEnvironments = (await space.getEnvironments()).items
    .filter((environment) => environment.sys.id.startsWith('prod-'))
    .sort(sortEnvironmentIdDescending);

  // Create new environment
  const environment = await makeTimestampedEnvironment(space, 'prod');

  // Run migrations
  const migrationRunner = new MigrationRunner(
    space,
    environment,
    accessToken,
    migrationsDirectory,
  );
  await migrationRunner.runAllNewMigrations();

  // Update master alias
  const master = await space.getEnvironmentAlias('master');
  master.environment.sys.id = environment.sys.id;
  master.update();
  console.log(
    `Updated master to point against environment '${environment.sys.id}'`,
  );

  // Delete older production deployments if exceeding numberOfBackupsToKeep
  const oldEnvironmentsToKeep = oldEnvironments.slice(0, numberOfBackupsToKeep);
  const oldEnvironmentsToDelete = oldEnvironments.slice(numberOfBackupsToKeep);
  console.log(
    `Keeping up to ${numberOfBackupsToKeep} old production environments as backup:`,
  );
  for (const e of oldEnvironmentsToKeep) {
    console.log(`  - ${e.sys.id}`);
  }
  if (oldEnvironmentsToDelete.length > 0) {
    console.log('Deleting older environments:');
    for (const e of oldEnvironmentsToDelete) {
      console.log(`  - ${e.sys.id}`);
      await e.delete();
    }
  }
};
