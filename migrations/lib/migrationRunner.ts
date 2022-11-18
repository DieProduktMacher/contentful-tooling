import type { Entry, Environment, Space } from 'contentful-management';
import * as contentfulMigration from 'contentful-migration';
import * as path from 'path';
import { readdir } from 'fs/promises';

export class MigrationRunner {
  space: Space;
  environment: Environment;
  accessToken: string;
  migrationsDirectory: string;

  constructor(
    space: Space,
    environment: Environment,
    accessToken: string,
    migrationsDirectory: string,
  ) {
    this.space = space;
    this.environment = environment;
    this.accessToken = accessToken;
    this.migrationsDirectory = migrationsDirectory;
  }

  // - Public API

  public async runAllNewMigrations() {
    const newMigrations = await this.getNewMigrations();

    if (newMigrations.length > 0) {
      console.log(
        `Running ${newMigrations.length} new migrations for environment '${this.environment.sys.id}'`,
        ...newMigrations.map((migrationName) => `\n - ${migrationName}`),
      );
    } else {
      console.log(
        `Environment '${this.environment.sys.id}' is up to date. No new migrations to run.`,
      );
    }

    for (const migration of newMigrations) {
      await this.runMigration(migration);
    }
  }

  // - Internal Helpers

  async getDefaultLocale(): Promise<string> {
    return (await this.environment.getLocales()).items.find(
      (locale) => locale.default,
    ).code;
  }

  async hasContentType(contentTypeId: string): Promise<boolean> {
    return this.environment
      .getContentType(contentTypeId)
      .then(() => true)
      .catch((error) => {
        if (error.name === 'NotFound') {
          return false;
        } else {
          throw error;
        }
      });
  }

  // - Deployment Metadata

  async getOrCreateDeploymentMetadata(): Promise<Entry> {
    if (!(await this.hasContentType('deploymentMetadata'))) {
      console.log(
        `Environment ${this.environment.sys.id} doesn't have deployment metadata info yet.`,
        'Creating deployment metadata content type and singleton entry',
      );
      await this.createDeploymentMetadata();
    }

    return this.getDeploymentMetadata();
  }

  async getDeploymentMetadata(): Promise<Entry> {
    const { items: deploymentMetadatas } = await this.environment.getEntries({
      content_type: 'deploymentMetadata',
    });

    if (deploymentMetadatas.length === 1) {
      return deploymentMetadatas[0];
    } else {
      throw new Error(
        `There should be exactly one entry of type 'deploymentMetadata' in environment '${this.environment.sys.id}`,
      );
    }
  }

  async createDeploymentMetadata() {
    // Create content type
    await this.runMigration('ROOT-CreateDeploymentMetadata.ts', false);
    // Create singleton entry
    await this.environment.createEntry('deploymentMetadata', {
      fields: {
        executedMigrations: {
          [await this.getDefaultLocale()]: ['ROOT-CreateDeploymentMetadata.ts'],
        },
      },
    });
  }

  async getCompletedMigrations(): Promise<string[]> {
    return (await this.getOrCreateDeploymentMetadata()).fields
      .executedMigrations[await this.getDefaultLocale()];
  }

  // - Migration runner

  async runMigration(
    migrationFileName: string,
    trackExecutionInContentfulState: boolean = true,
  ) {
    console.log('Executing migration: ', migrationFileName);
    const filePath = path.join(this.migrationsDirectory, migrationFileName);

    await contentfulMigration.runMigration({
      spaceId: this.space.sys.id,
      accessToken: this.accessToken,
      environmentId: this.environment.sys.id,
      yes: true,
      filePath,
    });

    if (trackExecutionInContentfulState) {
      await this.trackMigrationExecution(migrationFileName);
    }
  }

  /**
   * Add an executed migration to this list of executed migrations of deployment metadata in
   * contentful environment
   */
  async trackMigrationExecution(migrationFileName: string) {
    const deploymentMetadata = await this.getDeploymentMetadata();
    const defaultLocale = await this.getDefaultLocale();
    const migrationList =
      deploymentMetadata.fields.executedMigrations[defaultLocale];
    migrationList.push(migrationFileName);
    await deploymentMetadata.update();
  }

  // - Migration Scheduling

  async getAllMigrations() {
    return (await readdir(this.migrationsDirectory)).filter((file) =>
      /^\d+.*\.(js|ts)/.test(file),
    );
  }

  async getNewMigrations() {
    const completedMigrations = await this.getCompletedMigrations();
    return (await this.getAllMigrations()).filter(
      (migrationName) => !completedMigrations.includes(migrationName),
    );
  }
}
