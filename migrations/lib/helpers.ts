import * as path from 'path';
import * as dotenv from 'dotenv';
import type { Environment, Space } from 'contentful-management';
import { readFile } from 'fs/promises';

dotenv.config({
  path: path.resolve(process.cwd() + '/../.env'),
});

export const waitForEnvironmentReady = async (
  space: Space,
  environment: Environment,
  delay = 3000,
  maxNumberOfTries = 200,
) => {
  for (let i = 0; i < maxNumberOfTries; i++) {
    const status = (await space.getEnvironment(environment.sys.id)).sys.status
      .sys.id;
    if (status === 'ready') {
      return;
    } else if (status === 'failed') {
      throw `Environment ${environment.sys.id} is in failed state.`;
    } else if (i + 1 < maxNumberOfTries) {
      console.log(
        `Environment ${environment.sys.id} is not ready yet. ` +
          `Retrying in ${delay / 1000}s. ` +
          `[${i + 1}/${maxNumberOfTries}]`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(
    `Timeout waiting for environment ${environment.sys.id} to finish processing`,
  );
};

export const getStringDate = (): string => {
  const d = new Date();
  const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
  return (
    d.toISOString().substring(0, 10) +
    '-' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds())
  );
};

export const makeTimestampedEnvironment = async (
  space: Space,
  namePrefix: string,
  sourceEnvironmentId: string = 'master',
) => {
  const environmentId = namePrefix + '-' + getStringDate();

  console.log(`Creating new environment '${environmentId}'`);
  const environment = await space.createEnvironmentWithId(
    environmentId,
    {
      name: environmentId,
    },
    sourceEnvironmentId,
  );
  await waitForEnvironmentReady(space, environment);
  // TODO: Update access permissions of content delivery api tokens to include new environment
  return environment;
};

export const getSpaceId = () => {
  if (process.env.CONTENTFUL_SPACE) {
    return process.env.CONTENTFUL_SPACE;
  } else {
    throw new Error(
      "You didn't specify any Contentful space ID. " +
        'Please login into https://app.contentful.com/ and ' +
        'pass the space ID as a CONTENTFUL_SPACE environment variable',
    );
  }
};

export const getAccessToken = async (managementTokenFilePath: string) => {
  if (process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
    return process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  } else {
    try {
      return (await readFile(managementTokenFilePath, 'utf-8')).split('\n')[0];
    } catch {
      throw new Error(
        "You didn't specify any Contentful Managment API token. " +
          'Please go to https://app.contentful.com/account/profile/cma_tokens and ' +
          'generate a new personal access token. ' +
          'You can provide a token in a ' +
          managementTokenFilePath +
          ' file or pass it as a CONTENTFUL_MANAGEMENT_TOKEN environment variable',
      );
      // TODO: Add prompt to interactively enter token and save it to the file (for convenience)
    }
  }
};
