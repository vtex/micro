import React from 'react'

interface Props {
  data: {
    menu: Record<string, string>
  }
  error: any
}

const Page: React.SFC<Props> = ({ data }) => {
  const { menu } = data
  return <div>Hello Federated workd {JSON.stringify(menu)}</div>
}

export default Page
