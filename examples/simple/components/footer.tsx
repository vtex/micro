import React from 'react'

import { HeaderProps, LinkServer } from './header'

type Props = Pick<HeaderProps, 'Link'>

const Footer: React.SFC<Props> = ({ Link = LinkServer }) => (
  <footer>
    <div>This is the footer</div>
    <ul>
      <li>
        <Link className="link dim rebel-pink dib mr3" to="/">
          Home
        </Link>
      </li>
      <li>
        <Link className="link dim rebel-pink dib mr3" to="/about">
          About
        </Link>
      </li>
      <li>
        <Link className="link dim rebel-pink dib mr3" to="/product">
          product
        </Link>
      </li>
      <li>
        <Link className="link dim rebel-pink dib mr3" to="/reactOnly">
          react only
        </Link>
      </li>
    </ul>
  </footer>
)

export default Footer
