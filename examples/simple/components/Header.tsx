import React from 'react'

interface LinkServerProps {
  to: string
  className?: string
}

const LinkServer: React.SFC<LinkServerProps> = ({ to, className, children }) => (
  <a href={to} className={className}>{children}</a>
)

interface HeaderProps {
  Link?: React.SFC<{to: string, activeClassName?: string, className: String}>
  menu: Record<string, string>
}

export const Header: React.SFC<HeaderProps> = ({ menu, Link = LinkServer }) => {
  return (
    <header className="bg-rebel-pink fixed w-100 ph3 pv3 pv4-ns ph4-m ph5-l">
      <nav className="f6 fw6 ttu tracked">
        {Object.entries(menu).map(([key, value]) => (
          <Link key={key} className="link dim white dib mr3" activeClassName="link:hover" to={key}>{value}</Link>
        ))}
      </nav>
    </header>
  )
}
