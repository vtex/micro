import { Link } from '@vtex/micro-router/components'
import React from 'react'

const Footer: React.SFC = () => (
  <footer>
    <div className="uk-child-width-expand@s uk-text-center" uk-grid="">
      <div>
          <div className="uk-card uk-card-default uk-card-body">
            <Link to='/'>Home</Link>
          </div>
      </div>
      <div>
          <div className="uk-card uk-card-default uk-card-body">
            <Link to='/'>Home</Link>
          </div>
      </div>
      <div>
          <div className="uk-card uk-card-default uk-card-body">
            <Link to="/about">About</Link>
          </div>
      </div>
    </div>
  </footer>
)

export default Footer
