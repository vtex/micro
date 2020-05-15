import * as React from 'react'
import { LoadMicroComponent } from '@vtex/micro-react'

interface Props {
  data: any
  error: any
}

const Page: React.SFC<Props> = ({ data, error }) => {
  return (
    <div>Hello Wolrd {JSON.stringify(data)}</div>
  )
}

export default LoadMicroComponent(Page)
