import React from 'react'

interface LinkProps {
  to: string
  className: string
  activeClassName?: string
}

export const LinkServer: React.SFC<LinkProps> = ({
  to,
  className,
  children,
}) => (
  <a href={to} className={className}>
    {children}
  </a>
)

export interface HeaderProps {
  Link?: React.SFC<LinkProps>
  menu: Record<string, string>
}

export const Header: React.SFC<HeaderProps> = ({ menu, Link = LinkServer }) => {
  return (
    <header className="bg-rebel-pink fixed w-100 ph3 pv3 pv4-ns ph4-m ph5-l">
      <div>
        this is the header. The data in the menu comes from a server side
        fetching
      </div>
      <nav className="f6 fw6 ttu tracked">
        {Object.entries(menu).map(([key, value]) => (
          <Link
            key={key}
            className="link dim white dib mr3"
            activeClassName="link:hover"
            to={key}
          >
            {value}
          </Link>
        ))}
      </nav>
    </header>
  )
}
