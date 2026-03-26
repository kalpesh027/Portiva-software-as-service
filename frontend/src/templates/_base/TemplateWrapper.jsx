import { useEffect } from 'react'

export default function TemplateWrapper({ children, cssCode, seoTitle, seoDescription }) {
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'portiva-template-css'
    style.textContent = cssCode || ''
    document.head.appendChild(style)

    if (seoTitle) document.title = seoTitle
    if (seoDescription) {
      let meta = document.querySelector('meta[name=description]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = 'description'
        document.head.appendChild(meta)
      }
      meta.content = seoDescription
    }

    return () => {
      document.getElementById('portiva-template-css')?.remove()
    }
  }, [cssCode, seoTitle, seoDescription])

  return <>{children}</>
}
