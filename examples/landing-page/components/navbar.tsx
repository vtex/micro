import { Link } from '@vtex/micro-router/components'
import React, { useState } from 'react'

const NavBar: React.SFC = () => {
  return (
    <nav className="uk-navbar-container" uk-navbar="true">
      <div className="uk-navbar-left">
        <ul className="uk-navbar-nav">
          <li>
            <Link to='/' >Home</Link>
          </li>
          <li>
            <Link to='/fresh' >Fresh</Link>
          </li>
          <li>
            <Link to='/stale' >Stale</Link>
          </li>
          <li>
          <Link to='/null' >No Context</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default NavBar