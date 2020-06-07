export const tree = {
  build: {
    description: 'Access for Build Micro lifecycle',
    options: [
      {
        description: 'Build with dev environment',
        long: 'dev',
        type: 'boolean',
      },
    ],
    report: {
      description: 'Generate a report using the web build',
    },
    config: {
      description:
        'Print webpack config that would be generated in a normal build',
    },
  },
  bundle: {
    description: 'Access for Bundle Micro lifecycle',
    options: [
      {
        description: 'Build with dev environment',
        long: 'dev',
        type: 'boolean',
      },
    ],
    report: {
      description: 'Generate a report using a bundled build',
    },
    config: {
      description:
        'Print webpack config that would be generated in a normal bundle assembly',
    },
  },
  dev: {
    description: 'Develop a Micro project',
    options: [],
  },
  serve: {
    description: 'Serve a bundled Micro project',
    options: [
      {
        description: 'Build with dev environment',
        long: 'dev',
        type: 'boolean',
      },
      {
        description: 'Port to Serve the micro Project',
        short: 'p',
        type: 'number',
      },
    ],
  },
  setup: {
    description: 'Setup the current package.json as a Micro project',
    options: [
      {
        description:
          'Do not change files, just show what would be output by this command',
        long: 'dry',
        short: 'd',
        type: 'boolean',
      },
    ],
  },
  test: {
    description: 'Use Jest to run tests in the current project.',
  },
  options: [
    {
      description: 'Show help information',
      long: 'help',
      short: 'h',
      type: 'boolean',
    },
  ],
}
