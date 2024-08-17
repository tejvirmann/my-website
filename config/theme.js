/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')
module.exports = {
  navbar: {
    // title: "Tejvir S. Mann",
    logo: {
      alt: 'Tejvir S. Mann',
      src: 'img/logo-pcca.svg',
    },
    items: [
      { to: '/projects', label: 'Projects', position: 'right' },
      {
        label: 'Logs',
        position: 'right',
        to: '/logs',
        items: [
          {
            label: 'Tags',
            to: '/logs/tags/',
          },
          {
            label: 'Archive',
            to: '/logs/archive',
          },
        ],
      },
      // {
      //   label: 'Groups',
      //   position: 'right',
      //   to: '/groups',
      //   items: [
      //     {
      //       label: 'Eywal Research',
      //       to: '/groups/eywal',
      //     },
      //     {
      //       label: 'Tejvir Mann Show',
      //       to: '/groups/tejvirshow',
      //     },
      //     {
      //       label: 'Madison Group Builder',
      //       to: '/groups/builder',
      //     },
      //   ],
      // },
      // {
      //   label: 'About',
      //   position: 'right',
      //   to: '/about',
      //   items: [
      //     {
      //       label: 'About',
      //       to: '/about',
      //     },
      //   ],
      // },
      { to: '/about', label: 'About', position: 'right' },
      {
        href: 'http://tejvir.slack.com', // Use `href` for external links
        label: 'Chat',
        position: 'right',
        target: '_blank', // Open in a new tab
        rel: 'noopener noreferrer',
      },
    ],
  },
  footer: {
    //   links: [
    //     {
    //       title: 'PCC-Archive.org',
    //       items: [
    //         {
    //           label: 'About PCC Archive',
    //           to: '/about',
    //         },
    //         {
    //           label: 'Contribute',
    //           to: '/contribute',
    //         },
    //         {
    //           label: "PCC Archive's GitHub",
    //           href: 'https://github.com/CuratorCat/pcc-archive.org',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Tejvir S. Mann',
    //       items: [
    //         {
    //           label: 'Website',
    //           href: 'https://www.purrnelopescountryclub.com/',
    //         },
    //         {
    //           label: 'Discord',
    //           href: 'http://discord.gg/purrnelopescountryclub',
    //         },
    //         {
    //           label: 'Twitter',
    //           href: 'https://twitter.com/PurrnelopesCC',
    //         },
    //         {
    //           label: 'Official Links',
    //           to: '/official-links',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'More',
    //       items: [
    //         {
    //           label: 'Posts Archive',
    //           to: '/posts/archive',
    //         },
    //         {
    //           label: 'Posts Tags',
    //           to: '/posts/tags',
    //         },
    //       ],
    //     },
    //   ],
    copyright: `© ${new Date().getFullYear()} Tejvir S. Mann`,
  },
  // image: 'img/pcc-archive-soc.jpg',
  // metadata: [{ name: 'twitter:card', content: 'summary_large_image' }],
  prism: {
    theme: lightCodeTheme,
    darkTheme: darkCodeTheme,
  },
  colorMode: {
    defaultMode: 'light',
    disableSwitch: false,
    respectPrefersColorScheme: true,
  },
  // announcementBar: require('./announcementBar'),
  metadata: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1',
    },
  ],
  docs: {
    sidebar: {
      hideable: true,
    },
  },
}
