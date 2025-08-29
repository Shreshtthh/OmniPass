import { useState, useEffect } from 'react';
import { Search, Database, Shield, TrendingUp } from 'lucide-react';

const loadingSteps = [
  { icon: Search, text: "Connecting to wallet...", color: "text-primary" },
  { icon: Database, text: "Scanning Ethereum...", color: "text-blue-400" },
  { icon: Database, text: "Scanning Polygon...", color: "text-purple-400" },
  { icon: Shield, text: "Analyzing risk factors...", color: "text-yellow-400" },
  { icon: TrendingUp, text: "Calculating scores...", color: "text-accent" },
  { icon: Database, text: "Generating insights...", color: "text-primary" },
];

export const LoadingAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 95));
    }, 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const currentStepData = loadingSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        {/* Main Loading Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full glass-strong flex items-center justify-center mx-auto animate-pulse-glow">
            <Icon className={`w-12 h-12 ${currentStepData.color}`} />
          </div>
          
          {/* Orbital rings */}
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 border border-accent/20 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        </div>

        {/* Current Step Text */}
        <h2 className="text-2xl font-bold mb-2">Analyzing Your Wallet</h2>
        <p className={`text-lg mb-8 transition-all duration-500 ${currentStepData.color}`}>
          {currentStepData.text}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-3 mb-6 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <p className="text-muted-foreground text-sm">
          {progress}% Complete
        </p>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2 mt-6">
          {loadingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-primary scale-125' 
                  : index < currentStep 
                    ? 'bg-accent' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};