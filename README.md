<!-- TODO: Add badges from example template -->
<div align="center">
    <a href="https://www.dieproduktmacher.com/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/Logo_white.png">
  <img alt="Logo DPM" src="/Logo_black.png" width="150px">
  </picture>
  </a>
   <h1>DPM Contentful Tooling</h1>
</div>

## About The Project

This repository is used as a collection for useful contentful tools. The first tool added, is a migration tool to support schema creation in CI/CD.

<!-- **First of all**

- Review & test open PR, merge if it works as expected

**Further iterations**

- Update dependencies & migrate `contentful-migration` package to `contentful-cli`

- Create sample space in Contentful as sandbox for the migration tool
- Create migration scripts for commonly used components
  - Page
  - Metadata
  - CTA
  - Accordeon
  - Tabs
  - MediaWrapper


- Add sample types for the `contentful-js-sdk`


- Identify further refactoring / optimisations / features
- Have fun 🎸 -->

## Getting Started

### Prerequisites

- Make sure [Node.js](https://nodejs.org/) (>= v18) and NPM [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) is installed
- Set up / Access to a [Contentful](https://www.contentful.com/) space with read / write permissions

### Setup

1. Clone this repository

2. Run `npm install` on **root level** (it's a monorepo using [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces))

1. Create a new `.env` file based on the `.env.sample` file from the root folder of this repo and add your contentful credentials:

   ```
     CONTENTFUL_SPACE = **SPACE_ID**
     CONTENTFUL_MANAGEMENT_TOKEN = **PERSONAL_ACCESS_TOKEN**
   ```

#### Troubleshooting

- [How to generate personal tokens (Contentful-Managment-Token)](https://www.contentful.com/developers/docs/references/authentication/#getting-a-personal-access-token)
- [How to find contentful space ID](https://www.contentful.com/help/find-space-id/)

### Usage

#### Migration Tool (Contentful Schema CI/CD)

Run the migration tool via `npm run migration-tool <args...>` with the following argument options:

<table>
<tr>
  <td>

`deployProd`</td><td>deploy new version of production environment by running all new migrations</td>

  </tr>
  
  
  <tr>
  <td>
  
  `deployStage`</td><td>run new migrations on the current staging environment</td>
  </tr>
  
  <tr>
  <td>
  
  `ciTestMigrations`</td><td>test new migrations by running them against a new temporary ci environment</td>
  </tr>
    
  <tr>
  <td>
  
  `resetStage`</td><td>delete the contents of the stage environment and reset it to the state of the current master environment</td>
  </tr>
  <tr>
  <td>
  
  `createMigration <name>`</td><td>create a new migration file</td>
  </tr>
    <tr>
  <td>
  
  `diffContentTypes <environment1> <environment2>`</td><td>compares the content types of `environment1` with `environment2` based on a `JSON` file comparison</td>
  </tr>
    <tr>
  <td>
  
  `generateTypeDefinitions <environment>`</td><td>generates typescript types from all content types in the given `environment`. Types based on [contentful.js](https://github.com/contentful/contentful.js) library types.</td>
  </tr>
    <tr>
  <td>
  
  `listEnvironments`</td><td>list all available environments</td>
  </tr>
</table>

##### How to test if everything is set up correctly?

To test the the migration tool is setup correctly and is connected to the contentful space, you can run `npm run migration-tool listEnvironments` and you should see a table with all created environments on your contentful space.

## Roadmap

**Order** of the following list does not necessarily represent prioritization
### Migrations

- Publish as installable / executable NPM package
- Make it backwards compatibility with Contentful CLI < 10
- Add example migrations based on commonly used content types, e.g. Page Metadata, CTA, Accordeon, Tabs, MediaWrapper
- Create a documentation page
- Generalise deploy{Env} / reset{Env} scripts

### Other packages

- Add CSV (Excel, Numbers) to JSON Converter for content imports

## Contact

DieProduktmacher GmbH
Hofmannstraße 7a
81379 Munich

E-Mail: [code[at]produktmacher.com](mailto:code@produktmacher.com)
Website: [www.dieproduktmacher.com](https://www.dieproduktmacher.com)
