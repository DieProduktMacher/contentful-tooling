import { createClient } from 'contentful-management';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { diffContentTypes } from '../lib/environmentDiff';
import { CONFIG } from '../config';
import { getSpaceId, getAccessToken } from '../lib/helpers';
import { deployProd } from './commands/deployProd';
import { deployStage } from './commands/deployStage';
import { ciTestMigrations } from './commands/ciTestMigrations';
import { resetStage } from './commands/resetEnvironment';
import { listEnvironments } from './commands/listEnvironments';
import { createMigration } from './commands/createMigration';
import { generateTypeDefinitions } from '../lib/typeDefinitionGenerator';

const init = async () => {
  const spaceId = getSpaceId();
  const { accessTokenFilePath } = CONFIG;
  const accessToken = await getAccessToken(accessTokenFilePath);
  const client = createClient({ accessToken });
  const space = await client.getSpace(spaceId);

  return { accessToken, space };
};

export const cli = async () => {
  const { migrationsDirectory, typeGeneratorOutputFile } = CONFIG;

  yargs(hideBin(process.argv))
    .command({
      command: 'deployProd',
      describe:
        'deploy new version of production environment by running all new migrations',
      handler: async (argv) => {
        const { space, accessToken } = await init();
        await deployProd(space, accessToken, migrationsDirectory);
      },
    })
    .command(
      'deployStage',
      'run new migrations on the current staging environment',
      () => {},
      async (argv) => {
        const { space, accessToken } = await init();
        await deployStage(space, accessToken, migrationsDirectory);
      },
    )
    .command({
      command: 'ciTestMigrations',
      describe:
        'test new migrations by running them against a new temporary ci environment',
      builder: (cmd) =>
        cmd
          .boolean('generate-type-definitions')
          .describe(
            'generate-type-definitions',
            'generate type definitions from the migration results before deleting ci environment',
          )
          .boolean('keep')
          .describe(
            'keep',
            "don't delete ci environment, but keep it up for manual inspection",
          ),
      handler: async (argv) => {
        const { space, accessToken } = await init();
        await ciTestMigrations(space, accessToken, migrationsDirectory, {
          generateTypeDefinitions: argv['generate-type-definitions'] ?? false,
          keepEnvironment: argv['keep'] ?? false,
          typeGeneratorOutputFile,
        });
      },
    })
    .command({
      command: 'resetStage',
      describe:
        'delete the contents of the stage environment and reset it to the state of the current master environment',
      handler: async (argv) => {
        const { space } = await init();
        await resetStage(space);
      },
    })
    .command({
      command: 'createMigration <name>',
      describe: 'create a new migration file',
      builder: (cmd) =>
        cmd.positional('name', {
          describe: 'the name of the migration',
        }),
      handler: async (argv) => {
        await createMigration(argv.name as string, migrationsDirectory);
      },
    })
    .command({
      command: 'diffContentTypes <environment1> <environment2>',
      describe: '',
      builder: (cmd) =>
        cmd
          .positional('environment1', {
            describe: 'environmentId',
          })
          .positional('environment2', {
            describe: 'environmentId',
          }),
      handler: async (argv) => {
        const { space } = await init();
        const environment1 = await space.getEnvironment(
          argv.environment1 as string,
        );
        const environment2 = await space.getEnvironment(
          argv.environment2 as string,
        );

        await diffContentTypes(environment1, environment2);
      },
    })
    .command({
      command: 'generateTypeDefinitions <environment>',
      describe: '',
      builder: (cmd) =>
        cmd.positional('environment', {
          describe: 'environmentId',
        }),
      handler: async (argv) => {
        const { space } = await init();
        const environment = await space.getEnvironment(
          argv.environment as string,
        );

        await generateTypeDefinitions(environment, typeGeneratorOutputFile);
      },
    })
    .command({
      command: 'listEnvironments',
      describe: 'list all available environments',
      handler: async (argv) => {
        const { space } = await init();
        await listEnvironments(space);
      },
    })
    .demandCommand()
    .strict().argv;
};

cli();
