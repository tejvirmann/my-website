/* 
DATA FOR https://pcc-archive.org/resources

To submit a resource, make PR to https://github.com/CuratorCat/pcc-archive.org
Or you can create an Issue anonymously at https://github.com/CuratorCat/pcc-archive.org/issues/9

Data Object:
type Resource = {
  title: string
  description: string
  image: string
  website: string
  tags: ['favorite' | 'official' | 'social' | 'tool' | 'marketplace' | 'analytics' | 'other' | 'ens']
}

Image:
images are stored under `/src/data/resources/img/`
preferred image size: 640×320px
preferred image format: jpg
*/

import { Resource } from '.'

// prettier - ignore
export const Resources: Resource[] = [
  {
    title: 'Intermission',
    description: 'What is an epiphany?',
    image: 'intermission.png',
    website: 'logs/projects/intermission',
    tags: ['writing'],
  },
  {
    title: 'Hope Tiger',
    description: 'A random drawing of a tiger that is hopeful.',
    image: 'hope2.png',
    website: 'logs/projects/hopetiger',
    tags: ['drawing'],
  },
  {
    title: 'Bravv UI',
    description: 'UI work for fintech startup.',
    image: 'bravv.png',
    website: 'logs/projects/bravvui',
    tags: ['uimodeling'],
  },
  {
    title: 'CODAmarket UI',
    description: 'UI work for a luxury art company.',
    image: 'codamarket.png',
    website: 'logs/projects/codamarket',
    tags: ['uimodeling'],
  },
  {
    title: 'Tejvir Mann Show',
    description: 'A fun and exciting show.',
    image: 'tejvirshow.png',
    website: 'logs/projects/tejvirmannshow',
    tags: ['other'],
  },
  {
    title: 'Asterisk',
    description: '(*) (*) (*) (*) (*) (*) (*).',
    image: 'asterisk.jpg',
    website: '/logs/projects/asterisk',
    tags: ['painting'],
  },
  {
    title: 'Blue Bird',
    description: 'A bird that is blue.',
    image: 'bluebird.png',
    website: '/logs/projects/bluebird',
    tags: ['painting'],
  },
  {
    title: 'Last Supper 231',
    description: 'BBM Vol17.',
    image: 'supper2.png',
    website: '/logs/projects/lastsupper',
    tags: ['drawing', 'favorite'],
  },
  {
    title: 'Depressed Spirit',
    description: 'Stallion of the Albuquerque.',
    image: 'depspirit.jpg',
    website: '/logs/projects/depspirit',
    tags: ['drawing', 'favorite'],
  },
  {
    title: 'Aleopard',
    description: 'An alien leopard.',
    image: 'aleopard2.png',
    website: '/logs/projects/aleopard',
    tags: ['drawing'],
  },
  {
    title: 'Gallify',
    description: 'An iOS application for AR spaces.',
    image: 'gallify.png',
    website: '/logs/projects/gallify',
    tags: ['software', 'uimodeling'],
  },
  {
    title: 'Pink Pen',
    description: 'A bird that is pink.',
    image: 'pinkbird.jpg',
    website: '/logs/projects/pinkpen',
    tags: ['drawing', 'favorite'],
  },
  {
    title: 'Pencil Drawings 1.2.24',
    description: 'A bunch of pencil drawings.',
    image: 'pencildrawing.jpg',
    website: '/logs/projects/pencil-drawings',
    tags: ['drawing'],
  },
  {
    title: 'Another Day in the Carbonite',
    description: 'A bunch of pencil drawings.',
    image: 'carbonite.jpg',
    website: '/logs/projects/carbonite',
    tags: ['drawing'],
  },
  // {
  //   title: 'Long People',
  //   description: 'A bunch of vertically long drawings.',
  //   image: 'longppl.png',
  //   website: '/logs/projects/longppl',
  //   tags: ['drawing'],
  // },
  // {
  //   title: 'Photography 2023',
  //   description: 'Some funny pictures from 2023.',
  //   image: 'funny23.png',
  //   website: '/logs/projects/funnypics23',
  //   tags: ['other'],
  // },
  {
    title: 'Forest Language',
    description: 'Natural and Classical Computing.',
    image: 'forestlang.jpg',
    website: '/logs/projects/forestlanguage',
    tags: ['writing', 'favorite'],
  },
  // {
  //   title: 'Dishwasher Anime',
  //   description: 'The greatest anime ever!',
  //   image: 'dishwasher.png',
  //   website: '/logs/projects/dishwasher',
  //   tags: ['film', 'favorite'],
  // },
]
