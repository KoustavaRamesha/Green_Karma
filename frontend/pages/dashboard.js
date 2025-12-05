import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  Leaf,
  Home,
  Upload,
  History,
  Award,
  User,
  TrendingUp,
  Recycle,
  Coins,
  Calendar,
  X,
  ChevronRight,
  Camera,
  FileImage,
  Sparkles,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Gift,
  Trophy,
  Shield,
} from "lucide-react";
import { userAPI, wasteAPI, certificateAPI } from "../lib/api";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import Onboarding, { useOnboarding } from "../components/Onboarding";
import { CelebrationModal } from "../components/Confetti";
import { DashboardSkeleton } from "../components/Skeleton";
import {
  CertificateCard,
  CertificateModal,
  NoCertificates,
} from "../components/Certificate";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const CHART_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#6366f1"];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [qrModal, setQrModal] = useState({
    open: false,
    qrCode: null,
    submission: null,
  });

  // Certificate states
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [certificatesLoading, setCertificatesLoading] = useState(false);

  // Onboarding and celebration states
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const [celebration, setCelebration] = useState({
    show: false,
    title: "",
    message: "",
    icon: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await userAPI.getDashboard();
      setStats(response.data.stats);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch certificates when achievements tab is active
  const fetchCertificates = async () => {
    setCertificatesLoading(true);
    try {
      const response = await certificateAPI.getMyCertificates();
      setCertificates(response.data.certificates || []);
    } catch (error) {
      console.error("Certificates fetch error:", error);
      // Don't show error toast - certificates might not be available
    } finally {
      setCertificatesLoading(false);
    }
  };

  // Fetch certificates when achievements tab is selected
  useEffect(() => {
    if (activeTab === "achievements") {
      fetchCertificates();
    }
  }, [activeTab]);

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setCertificateModalOpen(true);
  };

  // Function to trigger celebration
  const triggerCelebration = (title, message, icon) => {
    setCelebration({ show: true, title, message, icon });
  };

  const handleShowQR = async (submissionId) => {
    try {
      setQrModal({ open: true, qrCode: null, submission: null });
      const response = await wasteAPI.getSubmission(submissionId);
      const submission = response.data.submission;
      setQrModal({
        open: true,
        qrCode: submission.qrCode,
        submission,
      });
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
      toast.error("Failed to load QR code");
      setQrModal({ open: false, qrCode: null, submission: null });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  const chartData = stats?.categoryBreakdown
    ? [
        { name: "Plastic", value: stats.categoryBreakdown.Plastic || 0 },
        { name: "Paper", value: stats.categoryBreakdown.Paper || 0 },
        { name: "Metal", value: stats.categoryBreakdown.Metal || 0 },
        { name: "E-waste", value: stats.categoryBreakdown.EWaste || 0 },
        { name: "Organic", value: stats.categoryBreakdown.Organic || 0 },
      ]
    : [];

  const sidebarItems = [
    { id: "overview", icon: Home, label: "Overview" },
    { id: "submit", icon: Upload, label: "Submit Waste" },
    { id: "history", icon: History, label: "History" },
    { id: "achievements", icon: Trophy, label: "Achievements" },
    { id: "rewards", icon: Award, label: "Rewards" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
      <Head>
        <title>Dashboard | Green Karma</title>
      </Head>

      <Navbar />

      {/* Certificate Modal */}
      <CertificateModal
        certificate={selectedCertificate}
        isOpen={certificateModalOpen}
        onClose={() => {
          setCertificateModalOpen(false);
          setSelectedCertificate(null);
        }}
      />

      {/* Onboarding Flow */}
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}

      {/* Celebration Modal */}
      <CelebrationModal
        show={celebration.show}
        onClose={() => setCelebration({ ...celebration, show: false })}
        title={celebration.title}
        message={celebration.message}
        icon={celebration.icon}
      />

      {/* Welcome Banner - Light Nature Theme */}
      <div className="relative bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 overflow-hidden border-b border-emerald-200/50">
        {/* Soft gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-200/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-200/40 to-transparent rounded-full blur-3xl" />

        {/* Subtle hills SVG */}
        <svg
          className="absolute bottom-0 w-full h-16 opacity-30"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(16, 185, 129, 0.3)"
            d="M0,100 L0,60 Q200,30 400,50 T800,30 T1200,50 T1440,20 L1440,100 Z"
          />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(" ")[0] || "Eco Warrior"}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Track your environmental impact and earn rewards
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-emerald-200 shadow-sm">
                <div className="text-sm text-gray-500">Total Tokens</div>
                <div className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                  <Coins className="w-5 h-5 text-emerald-600" />
                  {stats?.totalTokens?.toFixed(2) || 0}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg shadow-emerald-100/50 border border-emerald-100 sticky top-24"
            >
              <div className="p-2">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          activeTab === item.id
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                            : "text-gray-700 hover:bg-emerald-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {activeTab === item.id && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Stats in Sidebar */}
              <div className="border-t border-gray-100 mt-4 pt-4 px-4 pb-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Stats
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Recycled</span>
                    <span className="font-bold text-gray-900">
                      {stats?.totalRecycled?.toFixed(1) || 0} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Verified</span>
                    <span className="font-bold text-green-600">
                      {stats?.verifiedSubmissions || 0}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Stats Cards */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-green-500/20 cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Coins className="w-6 h-6" />
                          </div>
                          <div className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span>+12%</span>
                          </div>
                        </div>
                        <div className="text-4xl font-bold mb-1">
                          {stats?.totalTokens?.toFixed(2) || 0}
                        </div>
                        <div className="text-green-100 font-medium">
                          Carbon Tokens
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <div className="text-xs text-green-100">
                            Lifetime earnings • Top 15% users
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Recycle className="w-6 h-6" />
                          </div>
                          <div className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span>+8%</span>
                          </div>
                        </div>
                        <div className="text-4xl font-bold mb-1">
                          {stats?.totalRecycled?.toFixed(2) || 0}
                        </div>
                        <div className="text-blue-100 font-medium">
                          kg Recycled
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <div className="text-xs text-blue-100">
                            ≈ {((stats?.totalRecycled || 0) * 2.5).toFixed(1)}{" "}
                            kg CO₂ saved
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20 cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <div className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
                            <Target className="w-4 h-4 mr-1" />
                            <span>Verified</span>
                          </div>
                        </div>
                        <div className="text-4xl font-bold mb-1">
                          {stats?.verifiedSubmissions || 0}
                        </div>
                        <div className="text-purple-100 font-medium">
                          Submissions
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <div className="text-xs text-purple-100">
                            {stats?.pendingSubmissions || 0} pending
                            verification
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Category Breakdown Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card-elevated"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Recycling by Category
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Your environmental impact breakdown
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData} barRadius={[8, 8, 0, 0]}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e5e7eb"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                          }}
                          cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card-elevated"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Recent Activity
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Your latest recycling submissions
                        </p>
                      </div>
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      {stats?.recentActivity?.length > 0 ? (
                        stats.recentActivity.map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() =>
                              activity.status === "pending"
                                ? handleShowQR(activity.id)
                                : null
                            }
                            className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-green-200 transition-all ${
                              activity.status === "pending"
                                ? "cursor-pointer hover:bg-green-50 hover:shadow-md"
                                : "bg-gray-50/50"
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  activity.status === "verified"
                                    ? "bg-green-100"
                                    : activity.status === "pending"
                                    ? "bg-amber-100"
                                    : "bg-red-100"
                                }`}
                              >
                                <Recycle
                                  className={`w-6 h-6 ${
                                    activity.status === "verified"
                                      ? "text-green-600"
                                      : activity.status === "pending"
                                      ? "text-amber-600"
                                      : "text-red-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {activity.category}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {activity.weight} kg •{" "}
                                  {new Date(activity.date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600 text-lg">
                                +{activity.reward?.toFixed(2) || 0}
                              </div>
                              <div
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  activity.status === "verified"
                                    ? "bg-green-100 text-green-700"
                                    : activity.status === "pending"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {activity.status === "verified" && (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                {activity.status === "pending" && (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {activity.status === "rejected" && (
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                )}
                                {activity.status}
                                {activity.status === "pending" &&
                                  " • Tap for QR"}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">
                            No recent activity
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Start recycling to see your history here
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "submit" && (
                <motion.div
                  key="submit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <SubmitWasteTab onSuccess={fetchDashboardData} />
                </motion.div>
              )}
              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <HistoryTab />
                </motion.div>
              )}
              {activeTab === "rewards" && (
                <motion.div
                  key="rewards"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <RewardsTab stats={stats} />
                </motion.div>
              )}
              {activeTab === "achievements" && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Achievements Header */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                        <Trophy className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Achievements & Certificates
                        </h2>
                        <p className="text-gray-600">
                          Your blockchain-verified recycling achievements
                        </p>
                      </div>
                    </div>

                    {/* Achievement Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-amber-600">
                          {certificates.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Certificates
                        </div>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-emerald-600">
                          {certificates
                            .reduce((sum, c) => sum + (c.weight || 0), 0)
                            .toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">
                          kg Certified
                        </div>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {
                            certificates.filter((c) => c.blockchainVerified)
                              .length
                          }
                        </div>
                        <div className="text-sm text-gray-600">On-Chain</div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Info Banner */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <p className="text-sm text-emerald-800">
                        <span className="font-semibold">
                          Eco Champion Certificates
                        </span>{" "}
                        are awarded for submissions of 40kg or more. Each
                        certificate is cryptographically signed and optionally
                        recorded on the blockchain for permanent verification.
                      </p>
                    </div>
                  </div>

                  {/* Certificates List */}
                  {certificatesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                            <div className="flex-1">
                              <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                              <div className="h-4 bg-gray-200 rounded w-32" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : certificates.length > 0 ? (
                    <div className="space-y-4">
                      {certificates.map((cert) => (
                        <CertificateCard
                          key={cert.id}
                          certificate={cert}
                          onClick={() => handleViewCertificate(cert)}
                        />
                      ))}
                    </div>
                  ) : (
                    <NoCertificates />
                  )}
                </motion.div>
              )}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ProfileTab user={user} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() =>
              setQrModal({ open: false, qrCode: null, submission: null })
            }
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  QR Code for Verification
                </h3>
                <button
                  onClick={() =>
                    setQrModal({ open: false, qrCode: null, submission: null })
                  }
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {qrModal.qrCode ? (
                <div className="text-center">
                  <img
                    src={qrModal.qrCode}
                    alt="QR Code"
                    className="mx-auto w-full max-w-sm h-auto mb-6 rounded-lg shadow-md"
                  />

                  {/* Submission ID Display */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-xs text-gray-600 mb-1 font-medium">
                      SUBMISSION ID
                    </p>
                    <p className="font-mono text-sm font-bold text-gray-900 break-all select-all">
                      {qrModal.submission?.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      📋 Tap to select and copy
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-semibold text-gray-900">
                      {qrModal.submission?.category}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Weight</p>
                    <p className="font-semibold text-gray-900">
                      {qrModal.submission?.weight} kg
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-6">
                    Show this QR code to a verifier to get your waste verified
                  </p>
                </div>
              ) : (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Submit Waste Tab Component
function SubmitWasteTab({ onSuccess }) {
  const [formData, setFormData] = useState({
    category: "Plastic",
    weight: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("category", formData.category);
      data.append("weight", formData.weight);
      if (formData.image) {
        data.append("image", formData.image);
      }

      const response = await wasteAPI.submit(data);
      setSubmissionData(response.data.submission);
      toast.success("Waste submitted successfully!");
      onSuccess();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit waste");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-elevated">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Upload className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Submit Recycling Waste
          </h2>
          <p className="text-sm text-gray-500">
            Log your recycling and earn tokens
          </p>
        </div>
      </div>

      {submissionData ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Submission Successful!
          </h3>
          <p className="text-gray-500 mb-6">
            Your waste has been logged and is pending verification
          </p>

          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 max-w-sm mx-auto mb-6">
            <img
              src={submissionData.qrCode}
              alt="QR Code"
              className="mx-auto w-48 h-48 rounded-lg"
            />
          </div>

          {/* Submission ID Display */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6 max-w-md mx-auto">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-2">
              Submission ID
            </p>
            <p className="font-mono text-sm font-bold text-gray-900 break-all select-all bg-white px-3 py-2 rounded-lg">
              {submissionData.id}
            </p>
          </div>

          <p className="text-gray-600 mb-6 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
            Show this QR code to a verifier to earn your tokens
          </p>
          <button
            onClick={() => setSubmissionData(null)}
            className="btn-primary"
          >
            Submit Another
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Waste Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="input-field"
            >
              <option value="Plastic">🧴 Plastic (5 tokens/kg)</option>
              <option value="Paper">📄 Paper (3 tokens/kg)</option>
              <option value="Metal">🔩 Metal (4 tokens/kg)</option>
              <option value="EWaste">💻 E-waste (12 tokens/kg)</option>
              <option value="Organic">🌱 Organic (1 token/kg)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              className="input-field"
              placeholder="Enter weight in kilograms"
            />
            {formData.weight && formData.category && (
              <p className="text-sm text-green-600 mt-2 font-medium">
                ✨ Estimated reward:{" "}
                {(
                  parseFloat(formData.weight) *
                  ({ Plastic: 5, Paper: 3, Metal: 4, EWaste: 12, Organic: 1 }[
                    formData.category
                  ] || 0)
                ).toFixed(2)}{" "}
                tokens
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Photo (Optional)
            </label>
            <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-green-400 transition-colors bg-gray-50/50">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.files[0] })
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  {formData.image
                    ? formData.image.name
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.weight}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Submit Waste
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

// History Tab Component
function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await userAPI.getHistory();
      setHistory(response.data.history);
    } catch (error) {
      console.error("History fetch error:", error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-elevated">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 dark:bg-slate-700 rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recycling History
            </h2>
            <p className="text-sm text-gray-500">
              {history.length} total submissions
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {history.length > 0 ? (
          history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.status === "verified"
                        ? "bg-green-100"
                        : item.status === "pending"
                        ? "bg-amber-100"
                        : "bg-red-100"
                    }`}
                  >
                    <Recycle
                      className={`w-5 h-5 ${
                        item.status === "verified"
                          ? "text-green-600"
                          : item.status === "pending"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {item.category}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.actualWeight || item.weight} kg •{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === "verified"
                        ? "bg-green-100 text-green-700"
                        : item.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </div>
                  {item.status === "verified" && (
                    <div className="text-green-600 font-bold mt-1">
                      +{item.rewardAmount?.toFixed(2)} CARB
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No history yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your recycling submissions will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Rewards Tab Component
function RewardsTab({ stats }) {
  const rewardRates = [
    {
      name: "Plastic",
      rate: 5,
      icon: "🧴",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Paper",
      rate: 3,
      icon: "📄",
      color: "bg-amber-100 text-amber-600",
    },
    { name: "Metal", rate: 4, icon: "🔩", color: "bg-gray-100 text-gray-600" },
    {
      name: "E-waste",
      rate: 12,
      icon: "💻",
      color: "bg-purple-100 text-purple-600",
    },
    {
      name: "Organic",
      rate: 1,
      icon: "🌱",
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="card-elevated">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/25">
            <Coins className="w-10 h-10 text-white" />
          </div>
          <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {stats?.totalTokens?.toFixed(2) || 0}
          </div>
          <div className="text-xl text-gray-600 mb-8">
            Carbon Tokens Available
          </div>
          <Link href="/redeem" className="btn-primary inline-flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Browse Rewards Marketplace
          </Link>
        </div>
      </div>

      <div className="card-elevated">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Reward Rates</h3>
            <p className="text-sm text-gray-500">Tokens earned per kilogram</p>
          </div>
        </div>
        <div className="space-y-3">
          {rewardRates.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium text-gray-900">{item.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-green-600">
                  {item.rate}
                </span>
                <span className="text-sm text-gray-500">tokens/kg</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ user }) {
  return (
    <div className="card-elevated">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/25">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.name || "User"}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Full Name
          </label>
          <div className="font-medium text-gray-900 mt-1">
            {user?.name || "Not set"}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Email Address
          </label>
          <div className="font-medium text-gray-900 mt-1">
            {user?.email || "Not set"}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Wallet Address
          </label>
          <div className="font-mono text-sm text-gray-900 mt-1 break-all">
            {user?.walletAddress || "Not connected"}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Account Role
          </label>
          <div className="mt-1">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user?.role === "verifier"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1) ||
                "User"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
