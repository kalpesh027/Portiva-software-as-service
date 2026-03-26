import { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import TemplateNavbar from './components/TemplateNavbar'
import TemplateFooter from './components/TemplateFooter'
import Preloader from './components/Preloader'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Resume from './pages/Resume'

const pages = {
  home: Home,
  about: About,
  project: Projects,
  resume: Resume,
}

export default function DeveloperResumeMulti({ portfolio, currentPage = 'home' }) {
  const [load, updateLoad] = useState(true)
  const ActivePage = pages[currentPage] || Home

  useEffect(() => {
    const timer = setTimeout(() => {
      updateLoad(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  return (
    <>
      <Preloader load={load} />
      <div className="App" id={load ? 'no-scroll' : 'scroll'}>
        <TemplateNavbar portfolio={portfolio} />
        <ActivePage portfolio={portfolio} />
        <TemplateFooter portfolio={portfolio} />
      </div>
    </>
  )
}
