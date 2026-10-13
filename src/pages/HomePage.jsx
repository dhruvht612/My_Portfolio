import FuturisticHero from '../components/futuristic/FuturisticHero'
import FuturisticAbout from '../components/futuristic/FuturisticAbout'
import FuturisticProjectScene from '../components/futuristic/FuturisticProjectScene'
import FuturisticExperience from '../components/futuristic/FuturisticExperience'
import FuturisticSkills from '../components/futuristic/FuturisticSkills'
import FuturisticContact from '../components/futuristic/FuturisticContact'

/* The full walk: six sections, the camera's six waypoints in order. */
export default function HomePage() {
  return (
    <>
      <FuturisticHero />
      <FuturisticAbout />
      <FuturisticProjectScene />
      <FuturisticExperience />
      <FuturisticSkills />
      <FuturisticContact />
    </>
  )
}
