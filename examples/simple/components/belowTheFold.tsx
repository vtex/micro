import React, { Fragment } from 'react'

const BelowTheFold: React.SFC = () => {
  return (
    <Fragment>
      <ul>
        {[...Array(100)].map((_, index) => (<li key={index}>Item</li>))}
      </ul>
    </Fragment>
  )
}

export default BelowTheFold
