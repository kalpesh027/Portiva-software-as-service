import { useState } from 'react'
import { Container, Row } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import { AiOutlineDownload } from 'react-icons/ai'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import Particle from '../components/Particle'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export default function Resume({ portfolio }) {
  const [width] = useState(() => (typeof window === 'undefined' ? 1200 : window.innerWidth))
  const resumeUrl = portfolio?.resume_url

  return (
    <div>
      <Container fluid className="resume-section">
        <Particle />
        {resumeUrl && (
          <Row style={{ justifyContent: 'center', position: 'relative' }}>
            <Button variant="primary" href={resumeUrl} target="_blank" style={{ maxWidth: '250px' }}>
              <AiOutlineDownload />
              &nbsp;Download CV
            </Button>
          </Row>
        )}

        <Row className="resume">
          {resumeUrl ? (
            <Document file={resumeUrl} className="d-flex justify-content-center">
              <Page pageNumber={1} scale={width > 786 ? 1.7 : 0.6} />
            </Document>
          ) : (
            <div style={{ color: 'white', textAlign: 'center' }}>
              Resume not available yet.
            </div>
          )}
        </Row>

        {resumeUrl && (
          <Row style={{ justifyContent: 'center', position: 'relative' }}>
            <Button variant="primary" href={resumeUrl} target="_blank" style={{ maxWidth: '250px' }}>
              <AiOutlineDownload />
              &nbsp;Download CV
            </Button>
          </Row>
        )}
      </Container>
    </div>
  )
}
