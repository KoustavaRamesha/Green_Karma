import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Leaf,
  Recycle,
  Award,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  ChevronRight,
  Play,
  Users,
  Coins,
  BarChart3,
  Star,
  Trees,
  Mountain,
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

// Animated floating elements for hero
const FloatingLeaf = ({ delay, duration, className }) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ y: 0, rotate: 0, opacity: 0.4 }}
    animate={{
      y: [-10, 10, -10],
      rotate: [0, 10, -10, 0],
      opacity: [0.4, 0.6, 0.4],
    }}
    transition={{
      duration: duration || 4,
      delay: delay || 0,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <Leaf className="w-8 h-8 text-emerald-600" />
  </motion.div>
);

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <Recycle className="w-6 h-6" />,
      title: "Recycle & Earn",
      description:
        "Submit your recyclable waste and earn Carbon Tokens verified on the blockchain.",
      gradient: "from-emerald-500 to-green-600",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Government Verified",
      description:
        "Official verifiers ensure transparency and authenticity of every submission.",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Track Impact",
      description:
        "Monitor your environmental contribution and token rewards in real-time.",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Redeem Rewards",
      description:
        "Exchange your Carbon Tokens for cash, gift cards, and eco-friendly products.",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users", icon: Users },
    { value: "50K+", label: "KG Recycled", icon: Recycle },
    { value: "100K+", label: "Tokens Earned", icon: Coins },
    { value: "500+", label: "Verifiers", icon: Shield },
  ];

  const steps = [
    {
      step: "01",
      title: "Connect Wallet",
      description: "Link your crypto wallet to get started",
    },
    {
      step: "02",
      title: "Submit Waste",
      description: "Upload photos of your recyclable materials",
    },
    {
      step: "03",
      title: "Get Verified",
      description: "Official verifiers approve your submission",
    },
    {
      step: "04",
      title: "Earn Tokens",
      description: "Receive Carbon Tokens directly to your wallet",
    },
  ];

  const testimonials = [
    {
      quote:
        "Green Karma made recycling rewarding. I've earned over 500 tokens in just 2 months!",
      author: "Sarah M.",
      role: "Environmental Advocate",
      avatar: "S",
    },
    {
      quote:
        "The blockchain verification gives me confidence that my efforts are truly counted.",
      author: "James R.",
      role: "Tech Professional",
      avatar: "J",
    },
    {
      quote:
        "Finally, a platform that combines sustainability with real financial incentives.",
      author: "Priya K.",
      role: "Sustainability Consultant",
      avatar: "P",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border-b border-gray-100/50 dark:border-slate-800/50"
            : "bg-white/70 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-shadow">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Green Karma
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
              >
                How it Works
              </a>
              <a
                href="#testimonials"
                className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Testimonials
              </a>
            </div>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden sm:block text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <ConnectButton />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Light Nature Theme */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-white to-green-50" />

        {/* Soft nature gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-100/80 via-green-50/50 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-teal-100/60 via-emerald-50/40 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-green-100/50 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Soft rolling hills - Light SVG */}
        <div className="absolute inset-0">
          {/* Far hills */}
          <svg
            className="absolute bottom-0 w-full h-[45%]"
            viewBox="0 0 1440 400"
            preserveAspectRatio="none"
          >
            <path
              fill="rgba(167, 243, 208, 0.4)"
              d="M0,400 L0,280 Q200,200 450,250 T900,200 T1440,240 L1440,400 Z"
            />
          </svg>
          {/* Mid hills */}
          <svg
            className="absolute bottom-0 w-full h-[35%]"
            viewBox="0 0 1440 350"
            preserveAspectRatio="none"
          >
            <path
              fill="rgba(110, 231, 183, 0.3)"
              d="M0,350 L0,220 Q180,150 400,200 T850,160 T1200,190 T1440,150 L1440,350 Z"
            />
          </svg>
          {/* Near hills */}
          <svg
            className="absolute bottom-0 w-full h-[25%]"
            viewBox="0 0 1440 250"
            preserveAspectRatio="none"
          >
            <path
              fill="rgba(52, 211, 153, 0.25)"
              d="M0,250 L0,180 Q150,120 350,160 T750,130 T1100,150 T1440,110 L1440,250 Z"
            />
          </svg>
          {/* Foreground grass */}
          <svg
            className="absolute bottom-0 w-full h-[12%]"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path
              fill="rgba(16, 185, 129, 0.15)"
              d="M0,120 L0,80 Q200,50 400,70 T800,40 T1200,60 T1440,30 L1440,120 Z"
            />
          </svg>
        </div>

        {/* Decorative trees (light style) */}
        <div className="absolute bottom-[8%] left-0 right-0 flex items-end justify-around opacity-30">
          <Trees className="w-12 h-12 text-emerald-600" />
          <Trees className="w-20 h-20 text-emerald-500" />
          <Trees className="w-14 h-14 text-green-600" />
          <Trees className="w-24 h-24 text-emerald-600" />
          <Trees className="w-16 h-16 text-green-500" />
          <Trees className="w-20 h-20 text-emerald-500" />
          <Trees className="w-14 h-14 text-green-600" />
        </div>

        {/* Floating Leaves Animation */}
        <FloatingLeaf delay={0} duration={5} className="top-[20%] left-[10%]" />
        <FloatingLeaf
          delay={1}
          duration={4}
          className="top-[30%] right-[15%]"
        />
        <FloatingLeaf delay={2} duration={6} className="top-[40%] left-[20%]" />
        <FloatingLeaf
          delay={0.5}
          duration={5}
          className="top-[25%] right-[25%]"
        />
        <FloatingLeaf
          delay={1.5}
          duration={4.5}
          className="top-[35%] left-[5%]"
        />

        {/* Glowing Orbs - Light version */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-green-200/30 rounded-full blur-3xl" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 border border-emerald-200 shadow-sm"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>Now with blockchain verification</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
              <span className="block">The sustainable way to</span>
              <span className="block bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                recycle and earn
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your recyclables into Carbon Tokens. Verified by
              government officials, secured on the blockchain, rewarding for you
              and the planet.
            </p>

            {/* Trusted By Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-12"
            >
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-6">
                Trusted by eco-conscious organizations
              </p>
              <div className="flex items-center justify-center gap-8 lg:gap-12 flex-wrap">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">EcoVerify</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">GreenChain</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">EarthDAO</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Recycle className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">RecycleNet</span>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 hover:shadow-emerald-700/40 transition-all duration-300 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              >
                <Play className="mr-2 w-5 h-5 text-emerald-600" />
                Watch Demo
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-emerald-300 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-emerald-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-white dark:from-slate-800 dark:to-slate-900 h-32" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-emerald-100/50 dark:shadow-slate-900/50 border border-emerald-100 dark:border-slate-700 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 lg:py-32 bg-white dark:bg-slate-900 relative overflow-hidden"
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 dark:bg-emerald-900/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100 dark:bg-teal-900/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Features</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to go green
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform makes recycling rewarding, transparent, and
              impactful.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-gray-100 dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 h-full hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section
        id="how-it-works"
        className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 relative overflow-hidden"
      >
        {/* Nature-inspired subtle pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg
            className="absolute bottom-0 w-full h-48"
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
          >
            <path
              fill="rgba(16, 185, 129, 0.1)"
              d="M0,200 L0,100 Q360,50 720,100 T1440,80 L1440,200 Z"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Zap className="w-4 h-4" />
              <span>How it Works</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Start earning in 4 simple steps
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From waste to rewards in minutes. Our streamlined process makes it
              easy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-emerald-400 to-transparent z-10" />
                )}
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg shadow-emerald-500/25">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-24 lg:py-32 bg-white dark:bg-slate-900 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100 dark:bg-emerald-900/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Star className="w-4 h-4" />
              <span>Testimonials</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by eco-warriors worldwide
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See what our community has to say about their experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/25">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        {/* Nature-inspired gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800" />

        {/* Landscape silhouette */}
        <div className="absolute inset-0">
          <svg
            className="absolute bottom-0 w-full h-48 opacity-20"
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
          >
            <path
              fill="rgba(0,0,0,0.3)"
              d="M0,200 L0,120 Q200,80 400,100 T800,70 T1200,90 T1440,60 L1440,200 Z"
            />
          </svg>
          <svg
            className="absolute bottom-0 w-full h-32 opacity-30"
            viewBox="0 0 1440 150"
            preserveAspectRatio="none"
          >
            <path
              fill="rgba(0,0,0,0.2)"
              d="M0,150 L0,100 Q150,60 350,80 T700,50 T1100,70 T1440,40 L1440,150 Z"
            />
          </svg>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-400/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
              <Leaf className="w-4 h-4" />
              <span>Join the green revolution</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Ready to make a difference?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of eco-conscious users earning rewards while saving
              the planet. Start your green journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-bold rounded-2xl shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 text-lg"
              >
                Sign In
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
