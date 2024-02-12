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
    color: '#731ba6',
  },

  film: {
    label: 'Film',
    description: '',
    color: '#F7B500',
  },

  writing: {
    label: 'Writing',
    description: '',
    color: '#E72961',
  },

  drawing: {
    label: 'Drawing',
    description: '',
    color: '#5ad66b',
  },

  uimodeling: {
    label: 'UI Modeling',
    description: '',
    color: '#1D9BF0',
  },

  painting: {
    label: 'Painting',
    description: '',
    color: '#446A8E',
  },

  software: {
    label: 'Software',
    description: '',
    color: '#A91A32',
  },

  other: {
    label: 'Other',
    description: '',
    color: '#987050',
  },
}

export const TagList = Object.keys(Tags) as TagType[]
function sortResources() {
  let result = Resources
  // Sort by site name
  result = sortBy(result, resource => resource.title.toLowerCase())
  // Sort by favorite tag, favorites first
  result = sortBy(result, resource => !resource.tags.includes('favorite'))
  return result
}

export const sortedResources = sortResources()
