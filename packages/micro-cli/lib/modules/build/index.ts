import { Mode } from '@vtex/micro-core/lib';
import chalk from 'chalk';

import { newProject } from '../../common/project';
import { clean, getBuilders, rejectDeclarationFiles } from './builder';

interface Options {
  dev?: boolean
}

const lifecycle = 'build';

const main = async (options: Options) => {
  const dev = !!options.dev;
  const mode: Mode = dev ? 'development' : 'production';
  process.env.NODE_ENV = mode;

  const project = await newProject();

  console.log(`🦄 Starting Micro for ${chalk.magenta(project)} at ${chalk.blue(lifecycle)}:${chalk.blue(mode)}`);

  const { createBuild, createPreBuild } = await getBuilders(project, mode);

  await clean(project, lifecycle);

  console.log(`🦄 [${lifecycle}]: Starting the build`);

  const [framework, userland] = await Promise.all([
    project.root.getFiles('lib', 'plugins', 'index').then(rejectDeclarationFiles),
    project.root.getFiles('components', 'pages', 'router').then(rejectDeclarationFiles)
  ]);

  const msg = `🦄 [${lifecycle}]: The build of ${framework.length + userland.length} files finished in`;
  console.time(msg);
  const { prebuild } = await createPreBuild();
  await Promise.all(framework.map(f => prebuild(f, false)));

  const { build } = await createBuild();
  await Promise.all(userland.map(f => build(f, false)));
  console.timeEnd(msg);
};

export default main;
