# Micro
A React based Micro Frontend playground

## Repo Structure
All micro-related code is in the (yarn workspace)[https://classic.yarnpkg.com/en/docs/workspaces/] `./packages` repo. Some cool feature are shown in `./examples` folder.

In `./packages` you can find `micro-cli`. This is a `Next.JS` like cli that provides a webpack builder along with a server for SSR

Also, inside `./packages` folder you can find `./micro`, a part of the framework containing some root packages.
Having these packages comming from a single dependency makes that all micro components use the same react/loadable versions generating homogeneous code
Also `./packages/micro` contains some usefull code for partial hydration

## Running Examples
Since micro-cli is still not available in npm, you first need to build it and than run the examples

To build micro, just run
```sh
cd packages && yarn
cd micro-cli && yarn build
```

If everything went well, now go to your favorite example in `./examples` folder and run 
```sh
yarn && yarn build
```

This should generate the following terminal output

```
$ yarn && yarn build
yarn run v1.21.1
$ micro-cli --project .
🦄 Welcome to micro
>> Building client bundle...
>> Building client bundle...
>> Building client bundle...
>> Completed client bundle in 3.168s!
>> Completed client bundle in 3.211s!
>> Completed client bundle in 3.206s!
🦄 Server is UP on port http://localhost:3000
```

Just click on the url and check out the features

## Developing Micro CLI
Development of the Micro Framework CLI occurs in two steps, first, go to `./packages/micro-cli` and type
```sh
yarn watch
```

This will watch for changes in `.ts` files and output to transpiled files to `/dist` folder. 

To test the build, run the binary in a Micro Project. Micro projects can be found on `./packages/examples`

```sh
yarn start --project <path/to/example/micro/project>
```

## Features Checklist
- [x] Dinamic chunk loading
- [x] Async/Prefetch/Preload Scripts
- [x] Server Side Rendering
- [x] Optimized Cross Project Import
- [ ] Partial Hydration

Happy Coding ✨
