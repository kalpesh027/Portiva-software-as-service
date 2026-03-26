import { useLocation, useNavigate } from 'react-router-dom'

const buildQueryObject = (search) =>
  Object.fromEntries(new URLSearchParams(search).entries())

export const useRouter = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return {
    push: (href) => navigate(href),
    replace: (href) => navigate(href, { replace: true }),
    back: () => window.history.back(),
    prefetch: async () => undefined,
    pathname: location.pathname,
    query: buildQueryObject(location.search),
    asPath: `${location.pathname}${location.search}${location.hash}`,
  }
}