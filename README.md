# Micro
A Micro FrontEnd Framework built around extensibility and multi tenancy.

## Philosophy
Micro is built with the following principles

### Extensibility
The front-end world evolves rapidly, and thus, Micro is not attached to an specific technology or stack. It is built around a plugin based structure where even core features, like React, routing or GraphQL, are not part of the core framework.

### Performance
Performance should always be a limiting factor. If a plugin is not performatic by nature, it should not take the `micro` name on it

### Micro FrontEnd
Teams should be able to develop components independently and then assemble it into a final product with `no-costs` abstractions

### Multi Tenancy
A Micro rendering server should be able to deliver multiple different Micro Projects in the same instance performatically and securely.

## How it Works
The core of the Micro framework is the `@vtex/micro` package. This package defines a Micro Project. Any Micro Project is composed of a `package.json` file containing the project name, version, dependencies etc. 

There are four different types of Micro Projects:
1. Components
  - A project that contains a `/components` folder with `.tsx` files in it. This folder should be used for sharing front-end components across other Micro Projects
2. Pages
  - A project that contains a `/pages` folder with `.tsx` files in it. Files in this folder are *NOT* shareable across micro projects. Also, files in this folder main be served to the browser
3. Utils
  - A project that contains a `/utils` folder with `.ts` files in it. This should be used for sharing common logic across Micro Projects and front/back ends
4. Plugin
  - A project that contains a `/plugin` folder with `.ts` files in it. This folder allows you to hook up into the a Micro Project's lifecycle. Keep reading to understand what a Micro Project lifecycle is 

To operate a Micro Project, you need the `@vtex/micro-cli`. This cli gives you functionalities like packing Components, serving Pages, or adding Plugins

### How to share Components
TODO: 🦄

### How to serve Pages
TODO: 🦄

### How to share Utils
TODO: 🦄

### How to Plug In
TODO: 🦄

## Repo Structure
All micro-related code is in the (yarn workspace)[https://classic.yarnpkg.com/en/docs/workspaces/] `./packages` repo. Some cool feature are shown in `./examples` folder.

In `./packages` you can find `micro-cli`. This is a `Next.JS` like cli that provides a webpack builder along with a server for SSR. Also, this CLI allow you to develop Plugins and Pack your Micro Components

Also, inside `./packages` folder you can find `./micro`, a part of the framework containing some root packages.
Having these packages comming from a single dependency makes that all micro components use the same react/loadable versions generating homogeneous code
Also `./packages/micro` contains some usefull code for partial hydration

## Running Examples
Go to your favorite example in `./examples` folder and run 
```sh
yarn && yarn dev
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
- [ ] Plugins Support
- [ ] Official React Support
- [ ] Official Preact Support

Happy Coding ✨
