import * as path from 'path';

export const CONFIG = {
  /**
   * The filepath to read the Contentful Managment API from if no CONTENFUL_MANAGEMENT_TOKEN
   * environment variable is passed.
   *
   * On their personal machines, developers should fill this file using a personal access token
   * generated under https://app.contentful.com/account/profile/cma_tokens
   */
  accessTokenFilePath: path.resolve('./contentfulManagmentToken.secret.txt'),
  /**
   * The file system directory where to find the migrations to run.
   *
   * Regular migrations should follow the filename pattern YYYY-MM-DD-hhmmss-<MigrationName>.ts
   * Use the migration-tool createMigration command to create a new migration file.
   */
  migrationsDirectory: path.resolve('./migrations'),
  /**
   * The file path where to put newly auto-generated typescript type definitions for the content
   * model.
   */
  typeGeneratorOutputFile: path.resolve(
    './types/contentfulTypes.ts',
  ),
};
