import { useLocation, useNavigate } from 'react-router-dom'

export const useRouter = () => {
  const navigate = useNavigate()
  return {
    push: (href) => navigate(href),
    replace: (href) => navigate(href, { replace: true }),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    prefetch: async () => undefined,
  }
}

export const usePathname = () => useLocation().pathname

export const useSearchParams = () => new URLSearchParams(useLocation().search)

export const redirect = (href) => {
  window.location.assign(href)
}

export const notFound = () => {
  throw new Error('next/navigation notFound() is not supported in Vite runtime')
}