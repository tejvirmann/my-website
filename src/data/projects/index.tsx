/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable global-require */

import { Resources } from './data'
import { sortBy } from '@site/src/utils/jsUtils'

export type TagType = 'favorite' | 'writing' | 'film' | 'drawing' | 'software'| 'uimodeling' | 'painting' | 'other'

// prettier - ignore

export type Resource = {
  title: string
  description: string
  image: string
  website: string
  source?: string | null
  tags: TagType[]
}

export type Tag = {
  label: string
  description: string
  color: string
}

export const Tags: { [type in TagType]: Tag } = {
  favorite: {
    label: 'Favorite',
    description: '',
    color: '#D4A574', // Light brown/tan (central area)
  },

  film: {
    label: 'Film',
    description: '',
    color: '#FF6B9D', // Pink/Light Magenta
  },

  writing: {
    label: 'Writing',
    description: '',
    color: '#B19CD9', // Light Purple/Lavender
  },

  drawing: {
    label: 'Drawing',
    description: '',
    color: '#7DD3FC', // Light Blue/Cyan
  },

  uimodeling: {
    label: 'UI',
    description: '',
    color: '#FB923C', // Orange
  },

  painting: {
    label: 'Painting',
    description: '',
    color: '#C4B5FD', // Light Purple/Lavender variant
  },

  software: {
    label: 'Software',
    description: '',
    color: '#FDE047', // Yellow/Light Green
  },

  other: {
    label: 'Other',
    description: '',
    color: '#93C5FD', // Light Blue/Cyan variant
  },
}

export const TagList = Object.keys(Tags) as TagType[]
export { Resources }
function sortResources() {
  let result = Resources
  // Sort by site name
  result = sortBy(result, resource => resource.title.toLowerCase())
  // Sort by favorite tag, favorites first
  result = sortBy(result, resource => !resource.tags.includes('favorite'))
  return result
}

export const sortedResources = sortResources()
