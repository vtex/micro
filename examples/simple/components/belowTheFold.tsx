import React, { Fragment } from 'react'

const App: React.SFC = () => {
  return (
    <Fragment>
      <div className="uk-grid-small uk-child-width-expand@s uk-text-center" uk-grid="auto">
        <div>
          <div className="uk-card uk-card-default uk-card-body">Item</div>
        </div>
        <div>
          <div className="uk-card uk-card-default uk-card-body">Item</div>
        </div>
        <div>
          <div className="uk-card uk-card-default uk-card-body">Item</div>
        </div>
      </div>

      <div className="uk-grid-medium uk-child-width-expand@s uk-text-center" uk-grid="auto">
        <div>
          <div className="uk-card uk-card-default uk-card-body">Item</div>
        </div>
        <div>
          <div className="uk-card uk-card-default uk-card-body">Item</div>
        </div>
        <div>
          <div className="uk-card uk-card-default uk-card-body">Item</div>
        </div>
      </div>

      <div className="uk-grid-large uk-child-width-expand@s uk-text-center" uk-grid="auto">
        <div>
          <div className="uk-card uk-card-default uk-card-body">Item</div>
        </div>
        <div>
          <div className="uk-card uk-card-default uk-card-body">Item</div>
        </div>
        <div>
          <div className="uk-card uk-card-default uk-card-body">Item</div>
        </div>
      </div>

      <div className="uk-grid-collapse uk-child-width-expand@s uk-text-center uk-margin-large-top" uk-grid="auto">
        <div>
          <div className="uk-background-muted uk-padding">Item</div>
        </div>
        <div>
          <div className="uk-background-primary uk-padding uk-light">Item</div>
        </div>
        <div>
          <div className="uk-background-secondary uk-padding uk-light">Item</div>
        </div>
      </div>
    </Fragment>
  )
}

export default App
