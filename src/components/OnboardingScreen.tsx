import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { UtensilsCrossed, Clock, CheckCircle, ChevronRight } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (showAgain: boolean) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const steps = [
    {
      icon: UtensilsCrossed,
      title: 'Welcome to the Company Menu Selection System',
      description: 'Choose your meal, save time, and skip the paper.',
      color: 'text-blue-600'
    },
    {
      icon: Clock,
      title: 'How It Works',
      description: (
        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2 mt-1">
              <span className="text-blue-600">1</span>
            </div>
            <div>
              <h4>View today's menu</h4>
              <p className="text-sm text-gray-600">See all available meal options for the day</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 rounded-full p-2 mt-1">
              <span className="text-orange-600">2</span>
            </div>
            <div>
              <h4>Pick your preferred meal before 9:00 AM</h4>
              <p className="text-sm text-gray-600">Make your selection while on company premises</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-100 rounded-full p-2 mt-1">
              <span className="text-green-600">3</span>
            </div>
            <div>
              <h4>Enjoy your meal hassle-free!</h4>
              <p className="text-sm text-gray-600">Your selection is confirmed and recorded</p>
            </div>
          </div>
        </div>
      ),
      color: 'text-orange-600'
    },
    {
      icon: CheckCircle,
      title: 'Ready to get started?',
      description: 'Sign in to your account to begin selecting your meals.',
      color: 'text-green-600'
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(dontShowAgain);
    }
  };

  const handleSkip = () => {
    onComplete(dontShowAgain);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="pt-12 pb-8 px-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className={`bg-gradient-to-br ${step === 0 ? 'from-blue-100 to-blue-200' : step === 1 ? 'from-orange-100 to-orange-200' : 'from-green-100 to-green-200'} p-6 rounded-full`}>
                <Icon className={`w-12 h-12 ${currentStep.color}`} />
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="mb-3">{currentStep.title}</h1>
              {typeof currentStep.description === 'string' ? (
                <p className="text-gray-600">{currentStep.description}</p>
              ) : (
                currentStep.description
              )}
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 pt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === step
                      ? 'w-8 bg-blue-600'
                      : index < step
                      ? 'w-2 bg-blue-400'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4">
              {step === steps.length - 1 ? (
                <>
                  <Button
                    onClick={handleNext}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Get Started
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      id="dont-show"
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="dont-show" className="text-sm text-gray-600 cursor-pointer">
                      Don't show this again
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleNext}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    className="w-full"
                  >
                    Skip
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
