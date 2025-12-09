// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types')} */
const config = {
  title: 'Tejvir S. Mann',
  tagline: 'Official',
  url: 'https://tejvirmann.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'tejvirmann', // Usually your GitHub org/user name.
  projectName: 'my-website', // Usually your repo name.
  titleDelimiter: ' | ', // Defaults to `|`
  
  customFields: {
    funMode: process.env.FUN_MODE === 'true',
  },

  presets: require('./config/presets'),
  themeConfig: require('./config/theme'),
  plugins: require('./config/plugin'),
  scripts: [
    {
      src: './redirect.js', // create a file named redirect.js
      async: true,
    },
  ],
}

module.exports = config
