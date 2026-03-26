// Separate React root for portfolio rendering.
// No Redux. No Portiva App context. No nav/footer.
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './portfolio/portfolio-base.css'
import PortfolioRenderer from './portfolio/PortfolioRenderer'

const container = document.getElementById('portfolio-root')
if (container) {
  createRoot(container).render(
    <BrowserRouter>
      <Routes>
        <Route path='/:slug' element={<PortfolioRenderer />} />
        <Route path='/:slug/:page' element={<PortfolioRenderer />} />
      </Routes>
    </BrowserRouter>
  )
}
