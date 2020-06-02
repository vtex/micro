import loadable, { LoadableComponent } from '@loadable/component';
import { AsyncPageProps } from '@vtex/micro-react-router/components';

export const AsyncPages: LoadableComponent<any> = loadable<AsyncPageProps>(
  ({ name }) => import(`./pages/${name}`),
  { ssr: false }
);

export const AsyncImport = /* #__LOADABLE__ */ ({ name }: { name: string }) => import(`./pages/${name}`);
