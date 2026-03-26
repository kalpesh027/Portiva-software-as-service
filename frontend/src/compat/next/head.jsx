import { Children, useEffect } from 'react'

const ensureMeta = (selector, attrs) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value))
    document.head.appendChild(element)
  }
  return element
}

export default function Head({ children }) {
  useEffect(() => {
    const cleanup = []

    Children.forEach(children, (child) => {
      if (!child || !child.type) return

      if (child.type === 'title') {
        const previousTitle = document.title
        document.title = child.props.children || previousTitle
        cleanup.push(() => {
          document.title = previousTitle
        })
        return
      }

      if (child.type === 'meta') {
        const { name, property, content } = child.props
        if (!content) return

        if (name) {
          const meta = ensureMeta(`meta[name="${name}"]`, { name })
          const previous = meta.getAttribute('content')
          meta.setAttribute('content', content)
          cleanup.push(() => {
            if (previous === null) {
              meta.remove()
            } else {
              meta.setAttribute('content', previous)
            }
          })
        }

        if (property) {
          const meta = ensureMeta(`meta[property="${property}"]`, { property })
          const previous = meta.getAttribute('content')
          meta.setAttribute('content', content)
          cleanup.push(() => {
            if (previous === null) {
              meta.remove()
            } else {
              meta.setAttribute('content', previous)
            }
          })
        }
      }
    })

    return () => {
      cleanup.reverse().forEach((fn) => fn())
    }
  }, [children])

  return null
}