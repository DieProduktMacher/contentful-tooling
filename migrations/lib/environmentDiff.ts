import type { Environment } from 'contentful-management';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import * as _ from 'lodash';

function compare(value1, value2) {
  if (value1 < value2) return -1;
  else if (value1 == value2) return 0;
  else return 1;
}

const getSimplifiedExportForEnvironment = async (environment: Environment) => {
  const contentTypes = (await environment.getContentTypes()).items
    .sort((a, b) => compare(a.sys.id, b.sys.id))
    .map(({ sys, ...rest }) => ({
      sys: _.omit(
        sys,
        'createdAt',
        'createdBy',
        'environment',
        'firstPublishedAt',
        'publishedAt',
        'publishedCounter',
        'publishedVersion',
        'space',
        'updatedAt',
        'updatedBy',
        'version',
      ),
      ...rest,
    }));

  const editorInterfaces = (await environment.getEditorInterfaces()).items
    .sort((a, b) => compare(a.sys.contentType.sys.id, b.sys.contentType.sys.id))
    .map(({ sys, ...rest }) => ({
      sys: _.omit(
        sys,
        'createdAt',
        'createdBy',
        'environment',
        'firstPublishedAt',
        'publishedAt',
        'space',
        'updatedAt',
        'updatedBy',
        'version',
      ),
      ...rest,
    }));

  const locales = (await environment.getLocales()).items.map(
    ({ sys, ...rest }) => ({
      sys: _.omit(
        sys,
        'environment',
        'space',
        'createdBy',
        'createdAt',
        'updatedBy',
        'updatedAt',
        'id',
        'version',
      ),
      ...rest,
    }),
  );

  // ???: Should we also compare tags?
  return { contentTypes, editorInterfaces, locales };
};

export const diffContentTypes = async (
  environment1: Environment,
  environment2: Environment,
) => {
  const contentTypes1 = await getSimplifiedExportForEnvironment(environment1);
  const contentTypes2 = await getSimplifiedExportForEnvironment(environment2);

  await writeFile(
    '/tmp/contentTypes1.json',
    JSON.stringify(contentTypes1, null, 2),
  );
  await writeFile(
    '/tmp/contentTypes2.json',
    JSON.stringify(contentTypes2, null, 2),
  );
  // TODO: Allow other diff tools than opendiff (installed with Xcode on macOS)
  exec(`opendiff /tmp/contentTypes1.json /tmp/contentTypes2.json`);
};
