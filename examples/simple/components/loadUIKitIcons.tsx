import React, { useEffect } from 'react'

// This is necessary for loading the spinner correctly
export const loadUIkitIcons = async () => {
  const [UIkit, Icons] = await Promise.all([
    import(
      /* webpackChunkName: "uikit" */ 
      /* webpackPreload: true */
      'uikit'
    ),
    import(
      /* webpackChunkName: "uikit-icons" */ 
      /* webpackPreload: true */
      'uikit/dist/js/uikit-icons' as any
    )
  ])
  UIkit.default.use(Icons.default)
}

export const withUIKit = (App: React.ReactType): React.SFC => props => {
  useEffect(() => { loadUIkitIcons() })
  return (
    <App {...props} />
  )
}