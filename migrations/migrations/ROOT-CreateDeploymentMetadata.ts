import type { MigrationFunction } from 'contentful-migration';

const m: MigrationFunction = (
  migration,
  { makeRequest, spaceId, accessToken },
) => {
  const deploymentMetadata = migration
    .createContentType('deploymentMetadata')
    .name('Deployment Metadata')
    .description(
      'Do not edit this type manually.\nThe deployment state of this environment stored inside this type is automatically updated by the Continuous Integration pipeline.',
    );

  deploymentMetadata
    .createField('executedMigrations')
    .name('Executed Migrations')
    .type('Object')
    .localized(false)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false);

  deploymentMetadata.changeFieldControl(
    'executedMigrations',
    'builtin',
    'objectEditor',
    {
      helpText:
        'Tracks which content type migrations have already been executed on this environment.',
    },
  );
};

export = m;
