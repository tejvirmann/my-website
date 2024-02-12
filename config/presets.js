/** @type {import('@docusaurus/types').PresetConfig[]} */
module.exports = [
  [
    'classic',
    /** @type {import('@docusaurus/preset-classic').Options} */
    ({
      docs: {
        routeBasePath: '/',
        path: 'wiki',

        sidebarPath: require.resolve('../sidebars.js'),
        // Please change this to your repo.
        editUrl: 'https://github.com/tejvirmann',
        // exclude: ['**/some-folder/**'],
        // showLastUpdateAuthor: true,
        // showLastUpdateTime: true,
      },
      blog: {
        routeBasePath: 'logs',
        path: 'logs',
        blogTitle: 'Logs',
        blogDescription: 'Tejvirs Logs',
        showReadingTime: false,
        postsPerPage: 1,
        blogSidebarCount: 15,
        // Please change this to your repo.
        editUrl: 'https://github.com/tejvirmann/my-website/tree/main/',
        blogSidebarTitle: 'Recent Logs',
      },
      theme: {
        customCss: require.resolve('../src/css/custom.scss'),
      },
    }),
  ],
]
