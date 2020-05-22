import React from 'react'

export const Grid: React.SFC = () => {
  return (
    <ul>
      {
        [...Array(9)].map((_, index) => (
          <li key={index}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </li>
        ))
      }
    </ul>
  )
}
