/** @type {import('@docusaurus/types').PluginConfig} */
module.exports = [
  'docusaurus-plugin-sass',
  [
    require.resolve('@easyops-cn/docusaurus-search-local'),
    {
      indexDocs: true,
      indexBlog: true,
      indexPages: true,
      language: ['en'],
    },
  ],
  [
    '@docusaurus/plugin-content-blog',
    {
      id: 'projects',
      routeBasePath: 'projects',
      path: './projects',
      blogTitle: 'Here are Tejvirs Projects',
    },
  ],
  async function myPlugin(context, options) {
    return {
      name: 'docusaurus-tailwindcss',
      configurePostCss(postcssOptions) {
        // Appends TailwindCSS and AutoPrefixer.
        postcssOptions.plugins.push(require('tailwindcss'))
        postcssOptions.plugins.push(require('autoprefixer'))
        return postcssOptions
      },
    }
  },
]
