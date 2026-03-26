// No Redux. No Portiva UI. Just the portfolio.
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import React from 'react'
import { getTemplate } from '../templates/index'
import TemplateWrapper from '../templates/_base/TemplateWrapper'

const RAW_API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const normalizeApiCandidates = (baseUrl) => {
  const trimmed = (baseUrl || '').replace(/\/+$/, '')
  const candidates = []

  if (trimmed) candidates.push(trimmed)
  if (trimmed && !/\/api$/i.test(trimmed)) {
    candidates.push(`${trimmed}/api`)
  }
  if (trimmed && /\/api$/i.test(trimmed)) {
    candidates.push(trimmed.replace(/\/api$/i, ''))
  }

  return [...new Set(candidates)]
}

const API_CANDIDATES = normalizeApiCandidates(RAW_API)

export default function PortfolioRenderer() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [TemplateComponent, setTemplateComponent] = useState(null)
  const [resolvedApiBase, setResolvedApiBase] = useState(API_CANDIDATES[0] || RAW_API)

  const { slug, page } = useParams()
  const currentSlug = slug || window.location.pathname.replace(/^\//, '').split('/')[0]

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(currentSlug) }, [currentSlug])

  async function fetchPublicPortfolio(slug, preferredBase) {
    const orderedBases = [preferredBase, ...API_CANDIDATES].filter(Boolean)
    const uniqueBases = [...new Set(orderedBases)]
    let lastError = null

    for (const base of uniqueBases) {
      try {
        const res = await fetch(`${base}/portfolio/public/${encodeURIComponent(slug)}`)
        if (!res.ok) {
          lastError = new Error(`HTTP ${res.status} from ${base}`)
          continue
        }

        const json = await res.json()
        if (base !== resolvedApiBase) {
          setResolvedApiBase(base)
        }
        return json
      } catch (error) {
        lastError = error
      }
    }

    throw lastError || new Error('Portfolio fetch failed')
  }

  async function load(slug) {
    try {
      const json = await fetchPublicPortfolio(slug, resolvedApiBase)
      if (json.ready && json.status === 'published') {
        await applyData(json)
      } else {
        setStatus('generating')
        poll(slug)
      }
    } catch (error) {
      console.error('Portfolio load failed:', error)
      setStatus('error')
    }
  }

  async function applyData(json) {
    try {
      const templateId = json.templateId || json.template_id || json.template_name || 'developer_minimal'
      const mod = await getTemplate(templateId)()
      setTemplateComponent(() => mod.default)
      setData(json)
      setStatus('ready')
    } catch (error) {
      console.error('Template load failed:', error)
      setStatus('error')
    }
  }

  function poll(slug) {
    let attempts = 0
    const id = setInterval(async () => {
      if (++attempts > 36) {
        clearInterval(id)
        setStatus('timeout')
        return
      }
      try {
        const json = await fetchPublicPortfolio(slug, resolvedApiBase)
        if (json.ready) {
          clearInterval(id)
          await applyData(json)
        }
      } catch {
        // keep polling
      }
    }, 10000)
  }

  // Inject template CSS
  useEffect(() => {
    if (!data?.css_code) return
    const style = Object.assign(document.createElement('style'), {
      id: 'tpl-css',
      innerHTML: data.css_code,
    })
    document.head.appendChild(style)
    return () => document.getElementById('tpl-css')?.remove()
  }, [data?.css_code])

  if (status === 'loading') return <Loader msg="Loading portfolio..." sub={`Slug: ${currentSlug}`} />
  if (status === 'generating') return <Loader msg="Building your portfolio…" sub="Takes 2–3 mins" />
  if (status === 'timeout') return <Loader msg="Still generating…" sub="Refresh in a minute" />
  if (status === 'error') return <NotFound slug={currentSlug} />
  if (!data || !TemplateComponent) return <NotFound slug={currentSlug} />

  // Backend returns camelCase DTO fields (templateType, cssCode, placeholderMap).
  // Keep snake_case fallbacks for compatibility with older responses.
  const pm = data.placeholderMap || data.placeholder_map || {}
  const templateType = data.templateType || data.template_type || 'single'
  const cssCode = data.cssCode || data.css_code || ''
  const seoTitle = pm.seo_title || pm.seoTitle || [pm.name, pm.title].filter(Boolean).join(' - ')
  const seoDescription = pm.seo_description || pm.seoDescription

  if (templateType === 'multi') {
    const T = TemplateComponent
    // Determine current page from route parameter, default to 'home' if no page specified
    const currentPage = page || 'home'
    
    return (
      <TemplateWrapper
        cssCode={cssCode}
        seoTitle={seoTitle}
        seoDescription={seoDescription}
      >
        <T portfolio={pm} currentPage={currentPage} />
      </TemplateWrapper>
    )
  }

  // single (default)
  const T = TemplateComponent
  return (
    <TemplateWrapper
      cssCode={cssCode}
      seoTitle={seoTitle}
      seoDescription={seoDescription}
    >
      <T portfolio={pm} />
    </TemplateWrapper>
  )
}

function Loader({ msg, sub }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0f0f0f',
        color: '#fff',
        fontFamily: 'sans-serif',
      }}
    >
      <p style={{ fontSize: '1.2rem', margin: '0 0 8px' }}>{msg}</p>
      {sub && <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>{sub}</p>}
    </div>
  )
}

function NotFound({ slug }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        padding: '20px',
      }}
    >
      <h2>Portfolio Not Found</h2>
      <p>Slug: <code>{slug || 'No slug'}</code></p>
      <p>URL: <code>{window.location.pathname}</code></p>
      <p style={{ color: '#666', textAlign: 'center', maxWidth: '400px' }}>
        The portfolio might not exist, be in draft mode, or the backend might be having issues.
      </p>
      <a href="/" style={{ marginTop: '20px', color: '#0066cc' }}>Go to Portiva</a>
    </div>
  )
}
