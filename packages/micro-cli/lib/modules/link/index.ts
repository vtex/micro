import { Mode } from '@vtex/micro-core/lib';
import { startDevServer } from '@vtex/micro-server';
import chalk from 'chalk';
import chokidar from 'chokidar';

import { newProject, resolvePlugins } from '../../common/project';
import { HOST, PUBLIC_PATHS, SERVER_PORT } from '../../constants';
import {
  clean,
  createGetFolderFromFile,
  getBuilders,
  lifecycle,
  rejectDeclarationFiles
} from '../build/builder';
import { installWebModules } from '../build/installer';

const waitForReady = (watcher: chokidar.FSWatcher) => new Promise(resolve => watcher.on('ready', resolve));

// TODO: We should call `micro build` first and than watch files.
// This would make the logic in one single place
const main = async () => {
  const mode: Mode = 'development';
  process.env.NODE_ENV = mode;

  const project = await newProject();

  console.log(`🦄 Starting Micro for ${chalk.magenta(project)} at ${chalk.blue(lifecycle)}:${chalk.blue(mode)}`);

  const { createBuild, createPreBuild } = await getBuilders(project, mode);

  await clean(project, 'build');

  console.log(`🦄 [${lifecycle}]: Starting the build`);

  const [framework, userland] = await Promise.all([
    project.root.getFiles('lib', 'plugins', 'index').then(rejectDeclarationFiles),
    project.root.getFiles('components', 'pages', 'router').then(rejectDeclarationFiles)
  ]);

  const msg = `🦄 [${lifecycle}]: Finished build project in`;
  console.time(msg);

  const { prebuild } = await createPreBuild();
  if (framework.length > 0) {
    const prebuildMsg = `🦄 [${lifecycle}]: Performing pre-build of cjs modules ${framework.length} files finished in`;
    console.time(prebuildMsg);
    await Promise.all(framework.map(f => prebuild(f, false)));
    console.timeEnd(prebuildMsg);
  }

  const { build, compiler: buildCompiler } = await createBuild();
  if (userland.length > 0) {
    const installMsg = `🦄 [${lifecycle}]: web_modules installation took`;
    console.time(installMsg);
    await installWebModules(buildCompiler);
    console.timeEnd(installMsg);

    const buildMsg = `🦄 [${lifecycle}]: Performing build ${userland.length} files finished in`;
    console.time(buildMsg);
    await Promise.all(userland.map(f => build(f, false)));
    console.timeEnd(buildMsg);
  }

  console.timeEnd(msg);

  // This function will select if we should apply Build or Prebuild
  // once a watched file changes
  const entryFromFile = createGetFolderFromFile(project);
  const compile = (f: string) => {
    const entry = entryFromFile(f);
    if (['lib', 'plugins', 'index.ts'].includes(entry)) {
      return prebuild(f);
    }
    return build(f);
  };

  const watcher = chokidar.watch(
    project.root.getGlobby('lib', 'plugins', 'components', 'pages', 'router', 'index'),
    { cwd: project.rootPath, ignoreInitial: true }
  );

  // TODO: I think we can safetely implement these
  watcher.on('addDir', () => { console.error('💣 not implemented: addDir'); });
  watcher.on('unlink', () => { console.error('💣 not implemented: unlink'); });
  watcher.on('unlinkDir', () => { console.error('💣 not implemented: unlinkDir'); });
  watcher.on('error', console.error);
  watcher.on('change', compile);
  watcher.on('add', compile);

  await waitForReady(watcher);

  const hasPages = (await project.root.getFiles('pages')).length > 0;
  const hasRouter = (await project.root.getFiles('router')).length > 0;
  if (hasRouter && hasPages) {
    console.log(`🦄 [${lifecycle}]: Starting DevServer`);

    await startDevServer({
      publicPaths: PUBLIC_PATHS,
      project,
      plugins: await resolvePlugins(project, 'serve'),
      host: HOST,
      port: SERVER_PORT
    } as any);
  }
};

export default main;
