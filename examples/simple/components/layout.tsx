import loadable from '@loadable/component';
import React, { Fragment } from 'react';

import { Header, HeaderProps } from './header';
import { Loading } from './loading';

const Footer = loadable(() => import(
  /* webpackChunkName: "Footer" */
  './footer'
));

type Props = HeaderProps & {
  NavLink: HeaderProps['Link']
}

export const Layout: React.SFC<Props> = ({ menu, children, NavLink, Link }) => (
  <Fragment>
    <Header menu={menu} Link={NavLink}/>
    { children }
    <Footer Link={Link} fallback={<Loading/>} />
  </Fragment>
);
