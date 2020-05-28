export const tree = {
  build: {
    description: 'Access for onBuild Micro lifecycle',
    options: [
      {
        description: 'Build with dev environment',
        long: 'dev',
        type: 'boolean'
      }
    ]
  },
  assemble: {
    description: 'Access for onAssemble Micro lifecycle',
    options: [
      {
        description: 'Build with dev environment',
        long: 'dev',
        type: 'boolean'
      }
    ],
    report: {
      description: 'Assemble and generate report'
    },
    config: {
      description: 'Print webpack config'
    }
  },
  link: {
    description: 'Develop a Micro project'
  },
  serve: {
    description: 'Serve an assembled Micro project',
    options: [
      {
        description: 'Build with dev environment',
        long: 'dev',
        type: 'boolean'
      },
      {
        description: 'Port to Serve the micro Project',
        short: 'p',
        type: 'number'
      }
    ]
  },
  setup: {
    description: 'Setup the current package.json as a Micro project',
    options: [
      {
        description: 'Do not change files, just show what would be output by this command',
        long: 'dry',
        short: 'd',
        type: 'boolean'
      }
    ]
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
