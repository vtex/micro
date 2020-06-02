import PurgeCSSPlugin from 'purgecss-webpack-plugin';
import { Configuration } from 'webpack';
import { Context, Util } from 'webpack-blocks';

type FirstOf<T extends [any]> = T extends [infer P] ? P : never

type Options = FirstOf<ConstructorParameters<typeof PurgeCSSPlugin>>

interface EnhancedContext extends Context {
  purgeCSSOptions: Options
}

const post = (context: Context, { addPlugin }: Util) => {
  const ctx = context as EnhancedContext;
  return addPlugin(new PurgeCSSPlugin(ctx.purgeCSSOptions));
};

export const purgeCSS = (options: Partial<Options>) => {
  return Object.assign(
    (context: Context) => {
      const ctx = context as EnhancedContext;
      ctx.purgeCSSOptions = {
        ...ctx.purgeCSSOptions,
        ...options
      };
      return (config: Configuration) => config;
    },
    { post }
  );
};
