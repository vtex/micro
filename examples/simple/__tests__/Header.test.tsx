import React from 'react'
import { render } from '@testing-library/react'

import { Header } from '../components/Header'

test('should not crash', () => {
  const menu = {
    '/': 'Home',
    '/about': 'About',
    '/500': '500',
    '/404': '404',
  }

  const { container } = render(<Header menu={menu} />)

  expect(container).toBeDefined()
})
