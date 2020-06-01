// const resolve = require('rollup-plugin-pnp-resolve');

// const pnp = require('pnpapi');

// const path = require('path');

// const commonjs = require('rollup-plugin-commonjs');

// const { PosixFS, ZipOpenFS } = require('@yarnpkg/fslib');
// const libzip = require('@yarnpkg/libzip').getLibzipSync();

// // This will transparently open zip archives
// const zipOpenFs = new ZipOpenFS({ libzip });

// // This will convert all paths into a Posix variant, required for cross-platform compatibility
// const crossFs = new PosixFS(zipOpenFs);

// // console.log(crossFs.readFileSync(`C:\\path\\to\\archive.zip\\package.json`));

// const resolve = (options) => ({
//   name: 'pnp',
//   async resolveId (importee, importer) {
//     // console.log(importee);

//     if (!pnp) {
//       return;
//     }

//     if (/\0/.test(importee)) {
//       return null;
//     }

//     if (path.isAbsolute(importee)) {
//       return null;
//     }

//     if (!importer) {
//       return;
//     }

//     const resolved = pnp.resolveToUnqualified(importee, importer, options);

//     if (!resolved) {
//       return null;
//     }

//     // let's try to use esm resolution logic
//     try {
//       const manifestPath = await pnp.resolveUnqualified(path.join(resolved, 'package.json'));
//       const manifest = await crossFs.readJsonPromise(manifestPath);
//       const field = manifest.module || manifest.main;
//       if (field && importee !== 'exenv') {
//         return path.join(manifestPath, '..', field);
//       }
//       return pnp.resolveUnqualified(resolved, importer);
//     } catch (err) {
//       // it was worthy a try. Let's resolve normally
//       return pnp.resolveUnqualified(resolved, importer);
//     }
//   }
// });

module.exports = {
  exclude: [
    'plugins/**/*',
    'dist/**/*',
    'router/*',
    '!**/*.ts?(x)',
    '**/*.d.ts'
  ],
  installOptions: {
    env: {
      NODE_ENV: 'development'
    },
    rollup: {
      // namedExports: {
      //   exenv: ['canUseDOM', 'canUseWorkers', 'canUseEventListeners', 'canUseViewport']
      // },
      // plugins: [
      //   resolve({ considerBuiltins: true })
      // ]
    }
  }
};
