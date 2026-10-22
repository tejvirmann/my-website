/** Log bodies: pictures are shown in the page gallery instead of inline, and links to other sites open in a new tab. */
export default function rehypeLog() {
  const isImg = n => n.type === 'element' && n.tagName === 'img'
  const empty = n => n.type === 'element' && n.tagName === 'p' && n.children.every(c => (c.type === 'text' && !c.value.trim()) || isImg(c))
  return tree => {
    const walk = node => {
      if (!node.children) return
      node.children = node.children.filter(c => !isImg(c) && !(c.type === 'element' && c.tagName === 'p' && empty(c) && c.children.some(isImg)))
      for (const c of node.children) {
        if (c.type === 'element' && c.tagName === 'a' && /^https?:\/\//.test(c.properties?.href ?? '')) {
          c.properties.target = '_blank'
          c.properties.rel = 'noopener noreferrer'
        }
        walk(c)
      }
    }
    walk(tree)
  }
}
