import type { Space } from 'contentful-management';
import * as enquirer from 'enquirer';
import { waitForEnvironmentReady } from '../../lib/helpers';

export const resetStage = async (space: Space) => {
  const { confirmation }: { confirmation: boolean } = await enquirer.prompt({
    type: 'confirm',
    name: 'confirmation',
    message:
      "Are you sure you want to delete everything in the environment 'stage' and reset its content to the state of the current master environment? This action cannot be reverted.",
  });

  if (!confirmation) {
    console.log('Aborting. No changes to stage environment');
  } else {
    console.log("Deleting environment 'stage'...");
    const oldEnvironment = await space.getEnvironment('stage');
    await oldEnvironment.delete();
    console.log("Recrating 'stage' from current master...");
    const newEnvironment = await space.createEnvironmentWithId(
      'stage',
      {
        name: 'stage',
      },
      'master',
    );
    console.log("Waiting for 'stage' to process...");
    await waitForEnvironmentReady(space, newEnvironment);
    console.log("New 'stage' environment created successfully.");
  }
};
