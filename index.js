#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import minimist from 'minimist';
import prompts from 'prompts';
import chalk from 'chalk';
import { argv } from 'process';

const colors = {
  cyan: chalk.cyanBright.bold,
  blue: chalk.blueBright.bold,
  yellow: chalk.yellowBright.bold,
  magenta: chalk.magentaBright.bold,
  red: chalk.redBright,
};

const args = minimist(process.argv.slice(2), { string: ['_'] });
const currentWorkingDirectory = process.cwd();

const frameworks = [
  {
    name: 'react',
    color: colors.cyan,
    variants: [
      {
        name: 'react-js',
        display: 'JavaScript',
        color: colors.yellow,
      },
      {
        name: 'react-ts',
        display: 'TypeScript',
        color: colors.blue,
      },
    ],
  },
  {
    name: 'next',
    color: colors.magenta,
    variants: [
      {
        name: 'next-js',
        display: 'JavaScript',
        color: colors.yellow,
      },
      {
        name: 'next-ts',
        display: 'TypeScript',
        color: colors.blue,
      },
    ],
  },
];

const templates = frameworks
  .map(
    (framework) =>
      (framework.variants &&
        framework.variants.map((variant) => variant.name)) || [framework.name]
  )
  .reduce((acc, val) => acc.concat(val), []);

const renameFiles = {
  _gitignore: '.gitignore',
};

const init = async () => {
  let targetDirectory = formatTargetDirectory(args._[0]);
  let template = argv.batteries || argv.b;

  const defaultTargetDirectory = 'with-batteries-project';
  const getProjectName = () =>
    targetDirectory === '.' ? path.basename(path.resolve()) : targetDirectory;

  let result = {};

  try {
    result = await prompts(
      [
        {
          type: targetDirectory ? null : 'text',
          name: 'projectName',
          message: 'What is the name of your project?',
          initial: defaultTargetDirectory,
          onState: (answer) => {
            targetDirectory =
              formatTargetDirectory(answer.value) || defaultTargetDirectory;
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDirectory) || isEmpty(targetDirectory)
              ? null
              : 'confirm',
          name: 'overwrite',
          message: () =>
            (targetDirectory === '.'
              ? 'Current directory'
              : `Target directory "${targetDirectory}"`) +
            ` is not empty. Remove existing files and continue?`,
        },
        {
          type: (_, { overwrite } = {}) => {
            if (overwrite === false) {
              throw new Error(colors.red('✖') + ' Operation cancelled');
            }
            return null;
          },
          name: 'overwriteChecker',
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
          name: 'packageName',
          message: 'Package name:',
          initial: () => toValidPackageName(getProjectName()),
          validate: (directory) =>
            isValidPackageName(directory) || 'Invalid package.json name',
        },
        {
          type: template && templates.includes(template) ? null : 'select',
          name: 'framework',
          message:
            typeof template === 'string' && !templates.includes(template)
              ? `"${template}" isn't a valid template. Please choose from below: `
              : 'Select a framework:',
          initial: 0,
          choices: frameworks.map((framework) => {
            const frameworkColor = framework.color;
            return {
              title: frameworkColor(framework.name),
              value: framework,
            };
          }),
        },
        {
          type: (framework) =>
            framework && framework.variants ? 'select' : null,
          name: 'variant',
          message: 'Select a variant:',
          choices: (framework) =>
            framework.variants.map((variant) => {
              const variantColor = variant.color;
              return {
                title: variantColor(variant.name),
                value: variant.name,
              };
            }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(colors.red('✖') + ' Operation cancelled');
        },
      }
    );
  } catch (cancelled) {
    console.log(cancelled.message);
    return;
  }

  // user choices associated with the prompts
  const { framework, overwrite, packageName, variant } = result;
  const root = path.join(currentWorkingDirectory, targetDirectory);

  if (overwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  // determine the template
  template = variant || template || framework;

  console.log(`\nSetting up your project in ${root}...`);

  const templateDirectory = path.resolve(
    fileURLToPath(import.meta.url),
    '..',
    `batteries-${template}`
  );

  const write = (file, content) => {
    const targetPath = renameFiles[file]
      ? path.join(root, renameFiles[file])
      : path.join(root, file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDirectory, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDirectory);
  for (const file of files.filter((f) => f !== 'package.json')) {
    write(file);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDirectory, 'package.json'), 'utf8')
  );

  pkg.name = packageName || getProjectName();
  write('package.json', JSON.stringify(pkg, null, 2));

  const packageInfo = packageFromUserAgent(process.env.npm_config_user_agent);
  const packageManager = packageInfo ? packageInfo.name : 'npm';

  console.log(`\nDone. Now run:\n`);
  if (root !== currentWorkingDirectory) {
    console.log(`  cd ${path.relative(currentWorkingDirectory, root)}`);
  }
  switch (packageManager) {
    case 'yarn':
      console.log(`  yarn`);
      console.log(`  yarn dev`);
      break;
    default:
      console.log(`  ${packageManager} install or yarn`);
      console.log(`  ${packageManager} run dev or yarn run dev`);
      break;
  }
  console.log();
};

// utility functions

function formatTargetDirectory(targetDirectory) {
  return targetDirectory?.trim().replace(/\/+$/g, '');
}

function copy(source, destination) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    copyDirectory(source, destination);
  } else {
    fs.copyFileSync(source, destination);
  }
}

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  );
}

function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-');
}

function copyDirectory(srcDirectory, destDirectory) {
  fs.mkdirSync(destDirectory, { recursive: true });
  for (const file of fs.readdirSync(srcDirectory)) {
    const srcFile = path.resolve(srcDirectory, file);
    const destFile = path.resolve(destDirectory, file);
    copy(srcFile, destFile);
  }
}

function isEmpty(path) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

function emptyDir(directory) {
  if (!fs.existsSync(directory)) {
    return;
  }
  for (const file of fs.readdirSync(directory)) {
    fs.rmSync(path.resolve(directory, file), { recursive: true, force: true });
  }
}

function packageFromUserAgent(userAgent) {
  if (!userAgent) return undefined;
  const packageSpec = userAgent.split(' ')[0];
  const packageSpecArr = packageSpec.split('/');
  return {
    name: packageSpecArr[0],
    version: packageSpecArr[1],
  };
}

init().catch((e) => {
  console.error(e);
});
