import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Recycle,
  QrCode,
  Gift,
  Coins,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle,
  Leaf,
} from "lucide-react";

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Welcome to Green Karma! 🌱",
    description:
      "Join thousands of eco-warriors making a real difference. Let us show you how to turn your recyclables into rewards.",
    icon: Leaf,
    color: "from-emerald-400 to-green-600",
    image: "/onboarding/welcome.svg",
  },
  {
    id: 2,
    title: "Submit Your Recyclables",
    description:
      "Take a photo of your recyclable waste (plastic, paper, metal, e-waste, organic) and submit it through the dashboard. It's that simple!",
    icon: Recycle,
    color: "from-blue-400 to-indigo-600",
    tips: [
      "Weigh your waste accurately",
      "Take clear photos",
      "Select the correct category",
    ],
  },
  {
    id: 3,
    title: "Get Your QR Code",
    description:
      "After submission, you'll receive a unique QR code. Take your waste to a nearby collection point and show this code to the verifier.",
    icon: QrCode,
    color: "from-purple-400 to-violet-600",
    tips: [
      "Save your QR code",
      "Find nearby verifiers on the map",
      "Visit within 7 days",
    ],
  },
  {
    id: 4,
    title: "Earn Carbon Tokens",
    description:
      "Once verified, you'll instantly earn Carbon Tokens based on the weight and type of waste. Watch your balance grow!",
    icon: Coins,
    color: "from-amber-400 to-orange-600",
    tips: [
      "More weight = more tokens",
      "Different materials have different rates",
      "Tokens are stored on blockchain",
    ],
  },
  {
    id: 5,
    title: "Redeem Amazing Rewards",
    description:
      "Exchange your tokens for cash, gift cards, or even plant trees! Every recycling action creates real value.",
    icon: Gift,
    color: "from-pink-400 to-rose-600",
    tips: [
      "Cash out to your bank",
      "Get gift cards instantly",
      "Support eco initiatives",
    ],
  },
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("onboardingComplete", "true");
    setIsVisible(false);
    setTimeout(() => onComplete?.(), 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const Icon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
        >
          {/* Header with gradient */}
          <div
            className={`relative h-48 bg-gradient-to-br ${step.color} overflow-hidden`}
          >
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(255 255 255 / 0.1)%27%3e%3cpath d=%27M0 .5H31.5V32%27/%3e%3c/svg%3e')]" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                key={step.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg"
              >
                <Icon className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            {/* Step indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {ONBOARDING_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {step.description}
                </p>

                {/* Tips */}
                {step.tips && (
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Pro Tips
                    </div>
                    <ul className="space-y-2">
                      {step.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrev}
                disabled={isFirstStep}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  isFirstStep
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${step.color} shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
              >
                {isLastStep ? (
                  <>
                    Get Started
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const isComplete = localStorage.getItem("onboardingComplete");
    const isLoggedIn = localStorage.getItem("token");

    if (isLoggedIn && !isComplete) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem("onboardingComplete");
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}
