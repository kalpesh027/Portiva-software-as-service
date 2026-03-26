import GitHubCalendar from 'react-github-calendar'
import { Row } from 'react-bootstrap'
import { getGithubUsername } from '../utils/portfolioData'

export default function GithubActivity({ portfolio }) {
  const username = getGithubUsername(portfolio)
  if (!username) return null

  return (
    <Row
      style={{
        justifyContent: 'center',
        paddingBottom: '10px',
        color: 'white',
      }}
    >
      <h1 className="project-heading pb-4" style={{ paddingBottom: '20px' }}>
        Days I <strong className="purple">Code</strong>
      </h1>
      <GitHubCalendar username={username} blockSize={30} blockMargin={10} color="#c084f5" fontSize={20} />
    </Row>
  )
}
