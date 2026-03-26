// Simple test version of PortfolioRenderer for debugging
import { useParams } from 'react-router-dom'

export default function TestPortfolioRenderer() {
  const { slug, page } = useParams()
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Portfolio Renderer Test</h1>
      <p><strong>Slug:</strong> {slug || 'No slug'}</p>
      <p><strong>Page:</strong> {page || 'No page (home)'}</p>
      <p><strong>URL:</strong> {window.location.pathname}</p>
      <div style={{ 
        padding: '20px', 
        background: '#f0f0f0', 
        marginTop: '20px',
        borderRadius: '5px' 
      }}>
        <h2>Route Working! ✅</h2>
        <p>The routing is now working correctly.</p>
        {slug === 'vyankatesh-bairagi' && <p>✅ Slug matches: vyankatesh-bairagi</p>}
      </div>
    </div>
  )
}