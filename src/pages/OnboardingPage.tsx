import { OnboardingScreen } from '../components/OnboardingScreen'
import { useNavigate } from 'react-router-dom'

export function OnboardingPage() {
  const navigate = useNavigate()

  const handleComplete = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenOnboarding', 'true')
    }
    navigate('/login')
  }

  return <OnboardingScreen onComplete={handleComplete} />
}