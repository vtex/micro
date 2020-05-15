export const tree = {
  build: {
    description: 'Access for onBuild Micro lifecycle',
    dev: {
      description: 'Watch files for changes and start DevServer if project contains pages'
    },
    prod: {
      description: 'Build production ready ES modules'
    }
  },
  assemble: {
    description: 'Access for onAssemble Micro lifecycle',
    report: {
      description: 'Assemble and generate report'
    }
  },
  serve: {
    description: 'Serve an assembled Micro project'
  },
  options: [
    {
      description: 'Show help information',
      long: 'help',
      short: 'h',
      type: 'boolean'
    }
  ]
}
