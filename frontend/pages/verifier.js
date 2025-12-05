import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  QrCode,
  CheckCircle,
  XCircle,
  LogOut,
  Clock,
  Package,
  Search,
  Camera,
  User,
  Shield,
  ArrowRight,
  Recycle,
  AlertCircle,
  History,
} from "lucide-react";
import { verifierAPI } from "../lib/api";
import toast from "react-hot-toast";
import QRScanner from "../components/QRScanner";

export default function Verifier() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [scanMode, setScanMode] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || userData.role !== "verifier") {
      router.push("/login");
      return;
    }

    setUser(userData);
    fetchPendingSubmissions();
    fetchHistory();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      const response = await verifierAPI.getPending();
      setPendingSubmissions(response.data.submissions);
    } catch (error) {
      console.error("Fetch pending error:", error);
      toast.error("Failed to load pending submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await verifierAPI.getHistory();
      setHistory(response.data.verifications);
    } catch (error) {
      console.error("Fetch history error:", error);
    }
  };

  const handleScanQR = async () => {
    if (!qrInput) {
      toast.error("Please enter submission ID");
      return;
    }

    try {
      const response = await verifierAPI.scanQR(qrInput);
      setSelectedSubmission(response.data.submission);
      setScanMode(false);
      setQrInput("");
      toast.success("Submission found successfully");
    } catch (error) {
      console.error("QR scan error:", error);
      toast.error("Invalid submission ID");
    }
  };

  const handleCameraScan = async (qrData) => {
    try {
      const response = await verifierAPI.scanQR(qrData);
      setSelectedSubmission(response.data.submission);
      setShowCamera(false);
      setScanMode(false);
      toast.success("QR code scanned successfully!");
    } catch (error) {
      console.error("QR scan error:", error);
      toast.error("Invalid QR code");
    }
  };

  const handleVerify = async (submissionId, approved, actualWeight) => {
    try {
      await verifierAPI.verify(submissionId, {
        approved,
        actualWeight: actualWeight || undefined,
      });

      toast.success(approved ? "Submission verified!" : "Submission rejected");
      setSelectedSubmission(null);
      fetchPendingSubmissions();
      fetchHistory();
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to verify submission");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-green-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <Shield className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading verifier dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
      <Head>
        <title>Verifier Dashboard | Green Karma</title>
      </Head>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Green Karma
                </span>
                <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                  Verifier
                </span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-emerald-50 rounded-full px-4 py-2 border border-emerald-100">
                <User className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-gray-700 font-medium">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Stats Banner - Light Theme */}
      <div className="relative bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 overflow-hidden border-b border-emerald-200/50">
        {/* Soft gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-200/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-200/40 to-transparent rounded-full blur-3xl" />

        {/* Subtle wave SVG */}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-700 text-sm font-medium mb-1">
                    Pending Review
                  </p>
                  <p className="text-4xl font-bold">
                    {pendingSubmissions.length}
                  </p>
                  <p className="text-xs text-emerald-600 mt-2">
                    Awaiting verification
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7" />
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium mb-1">
                    Verified Today
                  </p>
                  <p className="text-4xl font-bold">
                    {
                      history.filter(
                        (h) =>
                          new Date(h.verifiedAt).toDateString() ===
                          new Date().toDateString()
                      ).length
                    }
                  </p>
                  <p className="text-xs text-green-600 mt-2">Great progress!</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7" />
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-700 text-sm font-medium mb-1">
                    Total Verified
                  </p>
                  <p className="text-4xl font-bold">{history.length}</p>
                  <p className="text-xs text-teal-600 mt-2">All-time record</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <History className="w-7 h-7" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === "pending"
                ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Pending</span>
            {pendingSubmissions.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "pending"
                    ? "bg-white/20"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {pendingSubmissions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === "history"
                ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <History className="w-5 h-5" />
            <span>History</span>
          </button>
        </div>

        {/* QR Scanner Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Helper Info */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <QrCode className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-lg mb-2">
                  How to Verify Submissions
                </h4>
                <p className="text-sm text-emerald-700">
                  <strong>Easiest Method:</strong> Browse pending submissions
                  below and click "Verify" to review each one. You can also use
                  the QR scanner or enter a submission ID manually.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setScanMode(!scanMode)}
            className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              scanMode
                ? "bg-gray-200 text-gray-700"
                : "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl"
            }`}
          >
            <QrCode className="w-5 h-5 mr-2" />
            {scanMode ? "Close QR Lookup" : "Look Up by QR Code"}
          </button>
        </motion.div>

        {/* QR Scanner */}
        <AnimatePresence>
          {scanMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Scan or Lookup Submission
                </h3>
                <p className="text-gray-500 mb-6">
                  Choose how you'd like to verify: scan the QR code with your
                  camera or enter the submission ID manually.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Camera Scan Option */}
                  <button
                    onClick={() => setShowCamera(true)}
                    className="p-6 border-2 border-emerald-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-900 mb-1">
                        Scan with Camera
                      </h4>
                      <p className="text-sm text-gray-500">
                        Use your device camera to scan the QR code
                      </p>
                    </div>
                  </button>

                  {/* Manual Input Option */}
                  <div className="p-6 border-2 border-gray-200 rounded-xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Search className="w-5 h-5 text-gray-600" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-900">
                        Manual Entry
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        placeholder="Enter Submission ID..."
                        className="input-field font-mono text-sm"
                      />
                      <button
                        onClick={handleScanQR}
                        className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!qrInput}
                      >
                        Find Submission
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setScanMode(false);
                      setQrInput("");
                    }}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera QR Scanner */}
        {showCamera && (
          <QRScanner
            onScan={handleCameraScan}
            onClose={() => setShowCamera(false)}
          />
        )}

        {/* Selected Submission for Verification */}
        <AnimatePresence>
          {selectedSubmission && (
            <VerificationModal
              submission={selectedSubmission}
              onVerify={handleVerify}
              onClose={() => setSelectedSubmission(null)}
            />
          )}
        </AnimatePresence>

        {/* Pending Submissions */}
        {activeTab === "pending" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pendingSubmissions.length > 0 ? (
              pendingSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  {submission.imageUrl ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={submission.imageUrl}
                        alt="Waste"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                      <Package className="w-12 h-12 text-gray-400" />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {submission.category}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {submission.weight} kg
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Recycle className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {submission.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center"
                    >
                      Verify Submission
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">All caught up!</p>
                  <p className="text-sm text-gray-400 mt-1">
                    No pending submissions to verify
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Verification History */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Verification History
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {history.length} verifications completed
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.status === "verified"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {item.status === "verified" ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.category}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.user.name} •{" "}
                            {item.actualWeight || item.weight} kg
                          </div>
                          {item.status === "verified" && (
                            <div className="text-sm text-green-600 font-medium mt-1">
                              Reward: {item.rewardAmount?.toFixed(2)} CARB
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === "verified"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status === "verified" ? "Verified" : "Rejected"}
                        </span>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(item.verifiedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    No verification history
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your verified submissions will appear here
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Verification Modal Component
function VerificationModal({ submission, onVerify, onClose }) {
  const [actualWeight, setActualWeight] = useState(submission.weight);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await onVerify(submission.id, true, actualWeight);
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await onVerify(submission.id, false);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Verify Submission
              </h2>
              <p className="text-sm text-gray-500">
                Review and approve or reject
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold">
              {submission.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {submission.user.name}
              </div>
              <div className="text-sm text-gray-500">
                {submission.user.email}
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Category
              </label>
              <div className="font-bold text-gray-900 mt-1">
                {submission.category}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <label className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                Reported Weight
              </label>
              <div className="font-bold text-gray-900 mt-1">
                {submission.weight} kg
              </div>
            </div>
          </div>

          {/* Photo */}
          {submission.imageUrl && (
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Photo Evidence
              </label>
              <img
                src={submission.imageUrl}
                alt="Waste"
                className="w-full h-64 object-cover rounded-xl border border-gray-200"
              />
            </div>
          )}

          {/* Actual Weight Input */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Verified Weight (kg)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={actualWeight}
              onChange={(e) => setActualWeight(e.target.value)}
              className="input-field text-lg font-semibold"
            />
            <p className="text-xs text-gray-500 mt-2">
              Adjust if the actual weight differs from reported
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              Approve
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              Reject
            </button>
            <button
              onClick={onClose}
              className="sm:w-auto px-6 py-3.5 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 transition text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
