import type { Space } from 'contentful-management';

export const listEnvironments = async (space: Space) => {
  const environments = await space.getEnvironments();
  const names = environments.items
    .map((item) => ({
      name: item.name,
      updatedAt: item.sys.updatedAt ?? item.sys.createdAt,
    }))
    .sort((a, b) => {
      const updatedA = new Date(a.updatedAt);
      const updatedB = new Date(b.updatedAt);
      if (updatedA < updatedB) {
        return 1;
      } else if (updatedA > updatedB) {
        return -1;
      }
      return 0;
    });

  console.table(names);
};
