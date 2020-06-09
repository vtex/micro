# micro

> `micro` is a full-lifecycle meta-framework for fast web apps.

`micro` was born out of our (failed, yet instructive) attempt to create a "one-size-fits-all" web framework at VTEX, where we create diverse applications from storefronts, to admin interfaces, to Help portals. After struggling to create a single solution, we decided that we can achieve the desired consistency between VTEX products while also allowing individual teams to tailor their "framework" to their specific needs.

## Full lifecycle

`micro` manages an opinionated pipeline to help you tackle all aspects of creating and delivering a fast web application from source to production in a consistent way. Specifically, it's helps you:

- Develop (babel + postCSS, dev server without bundling, [future: storybook integration]),
- Run unit tests (jest),
- Bundle your application (webpack, code splitting, lazy loading),
- Run e2e tests (cypress),
- Measure performance (Lighthouse),
- Serve in production, in a multi-tenant infrastructure (Node, separating IO-bound data-fetching and routing from CPU-bound rendering)
- (Future) Monitor application errors (Splunk? Sentry?)
- (Future) Track user behaviour (GTM? Analytics?)

## Meta framework

Instead of trying to fit into one of the existing application frameworks like Next or Gatsby (and their tradeoffs), micro allows you to create your own framework by composing plugins that behave consistently across projects, but perform their functions differently for each use case. This allows large teams that manage multiple web products to have a consistent development and deployment experience, while optimizing for their individual problems. Need server side rendering? Just add a plugin. Need flexible routing logic to allow entrypoint selection depending on fetched data? Add a plugin. Need none of that? Skip the complexity and use just the core. Even the core framework/language choices (currently React) are implemented as plugins, so you could switch to e.g. preact for a specific project, and keep all the other opinionated, battle-tested functionality.

## Multi-tenant and Extensible

Finally, one important aspect of micro is that it is "multi-tenancy and extensibility first". Most of the existing solutions assume the application developer is responsible for all of the application code. When creating multi-tenant products which users can heavily customize, some challenges arise: you don't know all of your apps routes up front, you don't have all component code deployed alongside the framework, etc. micro is specifically tailored towards teams that create multi-tenant, extensible products.

## Core Principles

`micro` is built with the following philosophy:

### Extensibility

The front-end world evolves rapidly, and thus, `micro` is not attached to an specific technology or stack. It is built around a plugin based structure where even core features, like React, routing and GraphQL are not part of the core framework.

### Performance

Performance should always be a limiting factor. If a plugin is not performatic by nature, it should not take the `micro` name on it

### `micro` frontEnd

Teams should be able to develop components independently and then assemble them into a final product as a zero-cost abstraction.

### Multi Tenancy

A `micro` rendering server should be able to deliver multiple different `micro` projects in the same instance performatically and securely.

## Why build another framework

We started developing a low-code React+GraphQL framework back in 2017. Many of the tools and concepts available today were only a dream back them. This made us *invent some wheels* and make some good and bad choices on all of `micro`'s core principles. This lead us want to leverage all we've learned and reboot our Store Framework using modern tools. However, after an extensive research we've find out none of the available open source tools fit our needs. Below are the reasons why

### Gastby

At a first glance, Gastby was perfect for us. It had the performance mindset we needed. However, at VTEX we deal with thousands of merchants, each merchant having up to millions SKUs and building all those pages statically is a no-go. Perhaps if Gatsby finds a way of dynamically generating pages we can move to it.

### NextJS

NextJS was really similiar to what we needed. It had dynamic page generation via SSR (Server Side Rendering). However we could not find a way to serve multiple NextJS project's (with SSR) in the same server, breaking our multi tenancy principle.

### Pika

Pika has the `deno` mindset we like. However, performance is REALLY important to us and we think es6 still have a long way to go before being usable in production. However, their development experience was what we needed and we are currently using their amazing services in development.

After finding no solution was a perfect fit for us, we've decided to build our own, based on great ideas from

- Gatsby (Performance optimization and plugins)
- NextJS (Dynamicity, SSR and Static Pages Generation)
- Pika (Development experience and fast build times)
- Webpack (Bundling with performance budgets, tree shaking)
- @loadable/component (Future of react code splitting)
- React Router (Dynamic routing)
- Relay GraphQL (Cascading fetching and data masking problems)
- i18next (split translation files and fetch them as you go)

## What we've came out with

After many discussions, we've decided all our framework has to do is to opinionate your project's lifecycle and which build tools should be used in each lifecycle. The configuration of such tools (webpack/babel) is done via plugins and all the core `micro` framework knows is how to look after these plugins in your package.json's dependencies and run them.

For instance. If you want to make a React app using `micro`, you will need, at least, the `@vtex/micro-plugin-react` plugin. This plugin will actually fill the webpack/babel configuration with usable stuff for transpiling your code and putting it in a page. Using only the `@vtex/micro` won't make your React app renderable.

With this architecture, we hope to make a plugin based framework where new technology can be adopted incrementally. If you don't use a feature, say i18n, you don't get the bloatware that comes with it because, by desing, not even your build system knows about it. 

### Lifecycles

The development of a front-end application usually happens in three steps.

1. Build and development

In this phase you are not concerned with load times/lighthouse score. Your project just needs to have a great development experience. This is achieved by

- Transpiling fast
- Having an HMR ready environment
- Unminified Assets
- Source Maps
- Community tools integration (like react/apollo developer tools)

2. Assemble and verify

Now that you know your feature works, you need to know if it's performatic so you never slow down your code. This is achived by

- Gathering all micro front-end code into a single monolith so our compilers can optimize
- Code splitting techniques. (Currently we use the one entrypoint per page, but a plugin can change it)
- Minimizing CSS and JS
- Extracting and split CSS code as well (CSS may really harm the performance)
- Using performance budgets
- Analysing the [webpack stats](http://webpack.github.io/analyse)

3. Serve Requests

Now that your project was assembled from many different micro front-end apps, we need to serve the requests in a multi tenant way with SSR.

This still is a work in progress on how we can achieve multi-tenancy, however we are working on a `deno` server.

We've build these three steps into `micro`'s core. They are called `OnBuild`, `OnAssemble` and `OnRequest` respectively.

There is a build stack attached to each cycle.

`OnBuild` runs Babel and transpiles all project's code to `commonjs`. Also, if there is a `/components` or `/pages` folders, these are transpiled to `es6`. Plugins usually add configurations to the base Babel config so transpilations, like React, work

`OnAssemble` runs Webpack and bundles all code with one entrypoint per file in the `/pages` folder, that's why only projects with `/pages` folder can be assembled. Also, `micro` traverses the dependency tree searching for `micro` Packages and adds their `/components/**/*.ts(x)?` files to the compilation, so webpack has the impression we are in a monolitical app

`OnRequest` opens the generated artifacts in the `OnAssemble` phase and creates a multi-tenant/production ready server.

> Note: `OnRequest` phase is still not working well. We are working on it 💻

### How it Works

The core of the `micro` framework is the `@vtex/micro` package. This package defines a `micro` Project. Any `micro` Project is composed of a `package.json` file containing the project's name, version, dependencies etc. 

There are four different types of `micro` Projects:

1. Components
- A project that contains a `/components` folder with `.tsx` files in it. This folder should be used for sharing front-end components across other `micro` Projects

2. Pages
- A project that contains a `/pages` folder with `.tsx` files in it. Files in this folder are *NOT* shareable across micro projects. Also, files in this folder main be served to the browser
  
3. Lib
- A project that contains a `/lib` folder with `.ts` files in it. This should be used for sharing common logic across `micro` Projects and front/back ends

4. Plugin
- A project that contains a `/plugins` folder with `.ts` files in it. This folder allows you to hook up into the a `micro` Project's lifecycle. Keep reading to understand what a `micro` Project lifecycle is 

To operate a `micro` Project, you need the `@vtex/micro-cli`. This cli gives you functionalities like packing Components, serving Pages, or adding Plugins

## Getting started

`micro` is built around common tools like Webpack 4, Babel 7 and Yarn 2, so using packages from npm should not be a problem at all. Actually, if you use only packages from npm, `micro` will behave similarly to a multi tenant ready NextJS/Gatsby.

To start a `micro` project, just [start your usual yarn project](https://yarnpkg.com/cli/init)

```sh
yarn init
```

Setup `yarn` so that `yarn@2.x` is used for the project, as described at [`yarn` docs](https://yarnpkg.com/getting-started/install)

```sh
yarn set version berry
```

Since we're using [Yarn PnP](https://yarnpkg.com/features/pnp) and some packages are still not completely ready for it, it's better to set `pnpMode` to `loose`

```sh
yarn config set pnpMode "loose"
```

Add packages as usual (with `yarn add` etc etc). Also, add `micro`'s CLI so managing your project becomes easier

```sh
yarn add @vtex/micro-cli
```

Now, let's make this Project a little more `micro` friendly. In your project's root folder, run

```sh
yarn micro setup
```

> Tip: You can run this command with a `--dry` option so the cli only prints the changes it will make to your project, instead of writting them

This command will setup your Project to behave like a `micro` Project.

That's all for now.

### Sharing Components

Sharing components across `micro` projects is really easy. Any file created on `/components` folder is automatically available to packages depending on your. Just make sure there is an `index.ts` re-exporing the desired components on your project's root folder

To use a component exported from another `micro` Project, say `packageA@1.x`, just `yarn add componentsA@1.x` this package and use es6-like syntax to import it 

```ts
import { AwesomeComponent } from 'packageA'
```

To understand more on how this magic is done, please read the `micro` Internals section

### Serving Pages

Currently, there is a simple server in the `micro-server` package that is used for development. This server does not serves requests in a multi tenant way yet. We plan to release our production ready server called Render very soon. However, in the meanwhile using our toy server should be just fine. To serve a page, create a file inside the `/pages` folder and

```sh
yarn micro link
```

This should open a dev server with your page on it. To understand more about how pages are built, read `micro` Internals section

### Plugins

Plugins are a core concept in `micro`. If you want to develop a plugin, keep reading. If you want to use a plugin, this is the right place.
First of all, choose a plugin. For example purposes, I will use a routing plugin called `@vtex/micro-plugin-react-router`. Plugins are a normal npm package, so let's add it to our project. On your project root's folder run

```sh
yarn add @vtex/micro-plugin-react-router
```

Now, we need to tell `micro` that we want to use this plugin for certain lifecycles. To do so, open your project's package.json. Under the `micro` section (if there is no micro section run `yarn micro setup` in your project) add the following in plugins

```package.json
...
"micro": {
  "plugins": {
    "onRequest": [
      "@vtex/micro-plugin-react-router"
    ],
    "onAssemble": [
      "@vtex/micro-plugin-react-router"
    ]
  }
}
```

This tells `micro` to use the `@vtex/micro-plugin-react-router` plugin on these lifecycles. Read more about lifecycles in their section

### Libs

Sometimes we just want to have a folder to write and share pices of delightful functional code. Libs are for that.

Other `micro` projects can import your lib's folder code if you export it in your toplevel `index.ts`, but be carefull. You should only use lib-related code in either `/plugins` or `/lib` folder, using it on `/components` may harm your site's performance.

One cool fact about libs is that the framework of `micro` is actually defined in a lib. Check out `@vtex/micro/lib` to see how `micro` implements itself 

## Developing a plugin

Plugin development is based on lifecycles. Each lifecycle has plugins hooks. To implement a plugin hook, you just need to extend the lifecycle's base class, implement their methods and `export default` this class. The structure of the `/plugins` folder should be:
```
| plugins
  | onBuild
    | index.ts
  | onAssemble
    | index.ts
  | onRequest
    | index.ts
```

> Note: remember to `export default` your plugin class inside each `index.ts`.
> Tip: A simple plugin to start getting examples is the `@vtex/micro-plugin-react-router`. 

### OnBuild

The `OnBuild` plugin currently accepts adding to babel's config only. Your plugin may be asked to generate babel configs for `commonjs` or `es6` targets

### OnAssemble

The `OnAssemble` plugin currently only generates a WebPack config. 
Generating and merging webpack configs can be trubblesome. That's why we use the great `webpack-blocks` project.

### OnRequest

This is the most complex plugin. This plugin allows you to add any tag to the final html generated by a `micro` Server, like script tags, link tags, style tags and so on. 
Also, you have access to the request's data and the class is instantiated on each request, so we don't mix data from two different requests. 

You can use OnRequest plugins to add meta tags to your html or wrap components for Server Side Rendering. There are many more reasons of why you'd want to create a plugin for this lifecycle and I'm curious to see what the community will come up with

## Repo Structure

This repo uses [lerna](https://github.com/lerna/lerna) for mono repo managment.
All micro-related code is in the workspace [yarn](https://classic.yarnpkg.com/en/docs/workspaces/) `./packages` repo. Some cool feature are shown in `./examples` folder.

In `./packages` you can find `micro-cli`. This is a `Next.JS` like cli that provides a webpack builder along with a server for SSR. Also, this CLI allow you to develop Plugins and Pack your `micro` Components

Also, inside `./packages` folder you can find `./micro`, a part of the framework containing some root packages.
Having these packages comming from a single dependency makes that all micro components use the same react/loadable versions generating homogeneous code

## Running Examples

### Installing Dependencies

We use yarn2, which means when you run the typical `yarn` commands inside of micro, you'll be using yarn2. You can check that by running

```sh
yarn -v
```

If you're indeed running yarn2 in this project, everything should be good to go! Just install all dependencies as usual

```sh
yarn
```

Note that running `yarn` in the project root folder will install dependencies for all packages, since each of them is a [yarn workspace](https://next.yarnpkg.com/features/workspaces) and cache them for faster installs later.

### Building

Since this is a lerna managed monorepo we can run

```sh
lerna exec yarn build
```

This should build everything. Now, go to your favorite example in `./examples` folder and run

```sh
yarn micro link
```

This should generate the following terminal output

```sh
$ yarn micro link
🦄 Welcome to `micro`
🦄 Starting `micro` onBuild:development
🦄 Resolving dependencies
📦 `micro` package found: simple@1.x
📦 `micro` package found: @vtex/micro@1.x
📦 `micro` package found: @vtex/micro-plugin-react@1.x
📦 `micro` package found: @vtex/micro-plugin-react-router@1.x
🦄 [onBuild]: Resolving plugins
🔌 [onBuild]: Plugin found @vtex/micro
🔌 [onBuild]: Plugin found @vtex/micro-plugin-react
🎯 [onBuild]: Creating dist folder in .micro/onBuild
🦄 [onBuild]: Starting the build
🦄 [onBuild]: The build of 26 files finished in: 1.717s
🦄 [onBuild]: Starting DevServer
🦄 [onRequest]: Resolving plugins
🔌 [onRequest]: Plugin found @vtex/micro
🔌 [onRequest]: Plugin found @vtex/micro-plugin-react
🔌 [onRequest]: Plugin found @vtex/micro-plugin-react-router
🐙 [router]: Found router config
🦄 DevServer is UP on http://localhost:3000
```

Just click on the url and check out the features

## Developing `micro`

Currently, there is a problem when building `@vtex/micro`. Since micro builds itself, it requires to be built to allow it building. To achieve this, the yarn build performs 2 builds. However, for developing, you need to perform 2 watches.

First, run `yarn watch`. This will trigger `tsc`. Then, run `yarn micro link` so we build `/components` into an es6 module.

This is a hack and I don't really know how to solve this problem now. We'll survive 🎵🎵🎵

## Features Checklist

- [x] Plugins Support
- [x] Official React Support
- [ ] Official Preact Support

### Oficial Plugins Features Checklist

1. `@vtex/micro`
  - [x] Preloaded Data Fetching 
  - [ ] CSS

2. `@vtex/micro-plugin-react`
  - [x] Code Splitting
  - [x] Dinamic Chunk Loading
  - [x] Preload/Prefetch Scripts
  - [x] Server Side Rendering
  - [x] React Strict
  - [ ] Preloaded Data Fetching with Cuncurrent mode

3. `@vtex/micro-plugin-react-router`
  - [x] Dynamic Routing
  - [x] Link Prefetching via Props
  - [x] Asset Prefetching
  - [x] Preload `onMouseEnter`
  - [x] Prefetch when entering the viewport on Mobile
  - [ ] Transitions
  - [ ] Transitions with Cuncurrent mode
  - [ ] Fetch over Prefetch Priority
  - [ ] Prefetch Budget

4. `@vtex/micro-plugin-react-i18n` [comming...]
5. `@vtex/micro-plugin-react-images` [comming...]
6. `@vtex/micro-plugin-react-graphql` [comming...]
7. `@vtex/micro-plugin-react-storybook` [comming...]

## Specifics

Below are some specific docs of each plugin

### `micro` React Router

The current implementation of `micro` React Router is the following:

- Link and NavLink accept a `prefetch` option. If you pass this option, the component will prefetch the route route in any device type
- Link and NavLink will `preload` a page if `onMouseEnter` is triggered by your browser
- On Mobile devices, is the element enters on the viewport, it will trigger a prefetch on Link and NavLink components

Happy Coding ✨

---

*VTEX 2020 - Accelerate Commerce Transformation*
