import React, { Fragment } from 'react'

const HugeComponent: React.SFC = () => {
  return (
    <Fragment>
      <ul>
        {[...Array(10)].map((_, index) => (
          <li key={index}>
            Etiam luctus laoreet erat, nec laoreet augue malesuada ut.
          </li>
        ))}
      </ul>
    </Fragment>
  )
}

export default HugeComponent
