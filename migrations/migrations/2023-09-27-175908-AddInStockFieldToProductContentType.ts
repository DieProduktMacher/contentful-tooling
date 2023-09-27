import type { MigrationFunction } from 'contentful-migration';

const m: MigrationFunction = (migration) => {
  const product = migration.editContentType('product');

  product
    .createField('inStock')
    .name('Is in stock')
    .type('Boolean')
    .localized(false)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false);
};

export = m;
