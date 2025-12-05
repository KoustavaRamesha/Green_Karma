import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Leaf, ArrowLeft, Shield, Zap, CheckCircle } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      // Sign in with Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Verify with backend and get user data
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        idToken,
      });

      // Store token and user data
      localStorage.setItem("token", idToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Welcome back!");

      // Redirect based on role
      if (response.data.user.role === "verifier") {
        router.push("/verifier");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in cancelled");
      } else if (error.code === "auth/operation-not-allowed") {
        toast.error(
          "Google Sign-In is not enabled. Please enable it in Firebase Console."
        );
      } else if (error.response?.status === 401) {
        toast.error("Account not found. Please register first.");
      } else {
        toast.error(
          error.response?.data?.error || error.message || "Login failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Zap, text: "One-click sign in" },
    { icon: Shield, text: "Secure Google authentication" },
    { icon: CheckCircle, text: "No password needed" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Light Nature Theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 relative overflow-hidden">
        {/* Soft nature gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-200/60 via-green-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-200/50 via-emerald-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-green-200/30 rounded-full blur-3xl" />

        {/* Rolling hills SVG */}
        <svg
          className="absolute bottom-0 w-full h-[40%]"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(167, 243, 208, 0.5)"
            d="M0,400 L0,250 Q200,180 450,220 T900,180 T1440,220 L1440,400 Z"
          />
        </svg>
        <svg
          className="absolute bottom-0 w-full h-[30%]"
          viewBox="0 0 1440 300"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(110, 231, 183, 0.4)"
            d="M0,300 L0,200 Q180,140 400,180 T850,140 T1440,170 L1440,300 Z"
          />
        </svg>
        <svg
          className="absolute bottom-0 w-full h-[18%]"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(52, 211, 153, 0.3)"
            d="M0,180 L0,120 Q150,80 350,110 T750,80 T1440,100 L1440,180 Z"
          />
        </svg>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-white shadow-xl shadow-emerald-200/50 rounded-2xl flex items-center justify-center mb-8 border border-emerald-100">
              <Leaf className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome back to
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Green Karma
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md">
              Continue your sustainable journey and check your earned rewards.
            </p>

            <div className="flex items-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>10K+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>100% Secure</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-white via-gray-50 to-emerald-50/30">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Green Karma
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Access your dashboard and rewards
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 text-emerald-600 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white dark:bg-slate-800 text-sm text-gray-500 dark:text-gray-400">
                  Why Google Sign-in?
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
                  >
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm">{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Register Link */}
          <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Create one now
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
