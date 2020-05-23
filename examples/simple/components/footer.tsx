import { Link } from '@vtex/micro-react-router'
import React from 'react'

const Footer: React.SFC = () => (
  <footer>
    <div>This is the footer</div>
    <ul>
      <li><Link to='/'>Home</Link></li>
      <li><Link to='/about'>About</Link></li>
      <li><Link to='/product'>product</Link></li>
      <li><Link to='/reactOnly'>react only</Link></li>
    </ul>
  </footer>
)

export default Footer
