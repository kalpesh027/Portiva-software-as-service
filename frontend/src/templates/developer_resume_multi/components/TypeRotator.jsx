import Typewriter from 'typewriter-effect'
import { getHeroRoles } from '../utils/portfolioData'

export default function TypeRotator({ portfolio }) {
  const roles = getHeroRoles(portfolio)

  return (
    <Typewriter
      options={{
        strings: roles.length > 0 ? roles : ['Developer'],
        autoStart: true,
        loop: true,
        deleteSpeed: 50,
      }}
    />
  )
}
