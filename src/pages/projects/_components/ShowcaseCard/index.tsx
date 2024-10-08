/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import { Tags, TagList, type TagType, type Resource, type Tag } from '@site/src/data/projects'
import { sortBy } from '@site/src/utils/jsUtils'
import styles from './styles.module.css'

const TagComp = React.forwardRef<HTMLLIElement, Tag>(({ label, color, description }, ref) => (
  <li
    ref={ref}
    className={styles.tag}
    title={description}
    style={{
      backgroundColor: color,
      marginTop: -10,
    }}
  >
    <span className={styles.textLabel}>{label.toLowerCase()}</span>
  </li>
))

function ShowcaseCardTag({ tags }: { tags: TagType[] }) {
  const tagObjects = tags.map(tag => ({ tag, ...Tags[tag] }))

  // Keep same order for all tags
  const tagObjectsSorted = sortBy(tagObjects, tagObject => TagList.indexOf(tagObject.tag))

  return (
    <>
      {tagObjectsSorted.map((tagObject, index) => {
        const id = `showcase_card_tag_${tagObject.tag}`

        return <TagComp key={index} {...tagObject} />
      })}
    </>
  )
}

function ShowcaseCard({ resource }: { resource: Resource }) {
  return (
    <Link href={resource.website} className={styles.showcaseCardLink}>
      <li
        key={resource.title}
        className={
          'flex flex-col justify-between rounded-md bg-white/50 transition-all duration-150 dark:bg-black/50 border overflow-hidden group ' +
          styles.showcaseCard
        }
      >
        <div>
          <div className={styles.showcaseCardImage}>
            <img
              src={require('../../../../data/projects/img/' + resource.image).default}
              alt={resource.title}
              className="h-[200px] w-full object-cover"
            />
          </div>
          <div className="px-3 py-1">
            <div className={clsx(styles.showcaseCardHeader)}>
              <h4 className={styles.showcaseCardTitle}>
                <Link href={resource.website} className={styles.showcaseCardLink}>
                  {resource.title}
                </Link>
                &nbsp;
                <ShowcaseCardTag tags={resource.tags} />
              </h4>
              {/* {resource.tags.includes('favorite') && '💜'} */}
              {resource.source && (
                <Link
                  href={resource.website}
                  className={clsx('button button--secondary button--sm', styles.showcaseCardSrcBtn)}
                >
                  Source
                </Link>
              )}
            </div>
            {/* <p className={styles.showcaseCardBody}>{resource.description}</p> */}
          </div>
        </div>
        {/* <ul className={` ${styles.cardFooter}`}>
          <ShowcaseCardTag tags={resource.tags} />
        </ul> */}
      </li>
    </Link>
  )
}

// Another look for Showcase Card
// function ShowcaseCard({ resource }: { resource: Resource }) {
//   return (
//     <Link href={resource.website} className={styles.showcaseCardLink}>
//       <li
//         key={resource.title}
//         className={
//           'relative flex flex-col justify-between rounded-xl bg-white/50 sm:hover:scale-105 transition-all duration-150 dark:bg-black/50 border border-slate-500/10 dark:border-slate-500/0 overflow-hidden group ' +
//           styles.showcaseCard
//         }
//       >
//         <div className={`${styles.showcaseCardImage} relative h-[200px] overflow-hidden`}>
//           <img
//             src={require('../../../../data/resources/img/' + resource.image).default}
//             alt={resource.title}
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <div className="absolute inset-0 flex flex-col justify-end px-3 py-1 backdrop-blur-[5px] z-10">
//           <div className={clsx(styles.showcaseCardHeader)}>
//             <h4 className={styles.showcaseCardTitle}>
//               <Link href={resource.website} className={styles.showcaseCardLink}>
//                 {resource.title}
//               </Link>
//             </h4>
//             {resource.source && (
//               <Link
//                 href={resource.website}
//                 className={clsx('button button--secondary button--sm', styles.showcaseCardSrcBtn)}
//               >
//                 Source
//               </Link>
//             )}
//           </div>
//           <p className={`${styles.showcaseCardBody} mb-2`}>{resource.description}</p>
//           <ul className={` ${styles.cardFooter} mt-auto`}>
//             <ShowcaseCardTag tags={resource.tags} />
//           </ul>
//         </div>
//       </li>
//     </Link>
//   );
// }

export default React.memo(ShowcaseCard)
