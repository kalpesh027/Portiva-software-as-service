import { forwardRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'

const isExternalHref = (href) =>
  typeof href === 'string' && /^(https?:|mailto:|tel:|#)/.test(href)

const normalizeHref = (href) => {
  if (typeof href === 'string') return href
  if (href && typeof href === 'object') {
    const pathname = href.pathname || '/'
    const search = href.query
      ? `?${new URLSearchParams(href.query).toString()}`
      : ''
    const hash = href.hash ? `#${href.hash}` : ''
    return `${pathname}${search}${hash}`
  }
  return '/'
}

const Link = forwardRef(function Link(
  { href = '/', children, replace, scroll, shallow, prefetch, locale, ...props },
  ref
) {
  const to = normalizeHref(href)

  if (isExternalHref(to)) {
    return (
      <a href={to} ref={ref} {...props}>
        {children}
      </a>
    )
  }

  return (
    <RouterLink to={to} replace={replace} ref={ref} {...props}>
      {children}
    </RouterLink>
  )
})

export default Link