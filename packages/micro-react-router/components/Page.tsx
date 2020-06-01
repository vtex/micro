/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResolvedPage, Serializable } from '@vtex/micro-core';
import React, { Fragment, useContext } from 'react';
import { useLocation } from 'react-router-dom';

import { MicroRouterContext } from './Router/Router';

export interface Page<T extends Serializable = any> {
  name: string
  path: string
  data: T
}

export type RouterResolvedEntry<T> = {
  path: string
  data: T
}

export const unpack = <T extends Serializable>(packed: Page<T>) => packed.data;

export const pack = <T extends Serializable>(resolved: ResolvedPage<T>, path: string): ResolvedPage<Page<T>> => ({
  ...resolved,
  data: {
    data: resolved.data,
    name: resolved.name,
    path
  }
});

export const isPage = (obj: any): obj is Page =>
  typeof obj.name === 'string' &&
  typeof obj.path === 'string';

export const FetchCurrentPage: React.SFC = ({ children }) => {
  const router = useContext(MicroRouterContext);
  const location = useLocation();

  React.useEffect(
    () => { router.preloadPage(location); },
    [location]
  );

  return (
    <Fragment>
      {children}
    </Fragment>
  );
};
