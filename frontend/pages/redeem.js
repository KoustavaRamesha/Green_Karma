import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Wallet,
  History,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  Trophy,
  Clock,
  TrendingUp,
  Package,
  Check,
  Filter,
  Search,
  Crown,
  Flame,
  Heart,
  Coffee,
  ShoppingBag,
  Car,
  Smartphone,
  CreditCard,
  Leaf,
  Target,
  Award,
} from "lucide-react";
import api from "../lib/api";
import Confetti, { CelebrationModal } from "../components/Confetti";
import { RewardsSkeleton } from "../components/Skeleton";

const REWARDS = [
  {
    id: "cash-10",
    name: "$10 Cash Reward",
    description:
      "Convert your green tokens to real cash. Instant bank transfer or PayPal deposit.",
    cost: 100,
    category: "cash",
    icon: CreditCard,
    color: "emerald",
    popular: true,
    badge: "Most Popular",
  },
  {
    id: "cash-50",
    name: "$50 Cash Reward",
    description:
      "Premium cash out option with bonus. Best value for serious recyclers.",
    cost: 450,
    category: "cash",
    icon: Wallet,
    color: "green",
    badge: "Best Value",
    savings: "10%",
  },
  {
    id: "amazon-20",
    name: "$20 Amazon Gift Card",
    description:
      "Shop millions of products on Amazon. Digital delivery in minutes.",
    cost: 200,
    category: "giftcard",
    icon: ShoppingBag,
    color: "amber",
  },
  {
    id: "starbucks-15",
    name: "$15 Starbucks Card",
    description:
      "Treat yourself to your favorite coffee. Works at all Starbucks locations.",
    cost: 150,
    category: "giftcard",
    icon: Coffee,
    color: "orange",
    popular: true,
  },
  {
    id: "uber-25",
    name: "$25 Uber Credits",
    description:
      "Free rides or Uber Eats orders. Perfect for eco-friendly transportation.",
    cost: 250,
    category: "giftcard",
    icon: Car,
    color: "slate",
  },
  {
    id: "apple-50",
    name: "$50 Apple Gift Card",
    description:
      "For Apple products, accessories, apps, games, music, movies, and more.",
    cost: 500,
    category: "giftcard",
    icon: Smartphone,
    color: "gray",
    badge: "Premium",
  },
  {
    id: "tree-plant",
    name: "Plant a Tree",
    description:
      "We'll plant a tree in your name. Get a certificate and GPS location.",
    cost: 50,
    category: "eco",
    icon: Leaf,
    color: "emerald",
    badge: "Eco Hero",
  },
  {
    id: "carbon-offset",
    name: "Carbon Offset Credit",
    description:
      "Offset 1 ton of CO2 emissions. Verified climate impact certificate included.",
    cost: 300,
    category: "eco",
    icon: Target,
    color: "teal",
  },
];

const CATEGORIES = [
  { id: "all", name: "All Rewards", icon: Gift },
  { id: "cash", name: "Cash Out", icon: CreditCard },
  { id: "giftcard", name: "Gift Cards", icon: ShoppingBag },
  { id: "eco", name: "Eco Impact", icon: Leaf },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const colorMap = {
  emerald: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    gradient: "from-emerald-500 to-green-600",
    shadow: "shadow-emerald-500/20",
  },
  green: {
    bg: "bg-green-500",
    bgLight: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
    gradient: "from-green-500 to-emerald-600",
    shadow: "shadow-green-500/20",
  },
  amber: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
  orange: {
    bg: "bg-orange-500",
    bgLight: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    gradient: "from-orange-500 to-red-500",
    shadow: "shadow-orange-500/20",
  },
  slate: {
    bg: "bg-slate-700",
    bgLight: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    gradient: "from-slate-700 to-slate-900",
    shadow: "shadow-slate-500/20",
  },
  gray: {
    bg: "bg-gray-800",
    bgLight: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    gradient: "from-gray-700 to-gray-900",
    shadow: "shadow-gray-500/20",
  },
  teal: {
    bg: "bg-teal-500",
    bgLight: "bg-teal-50",
    text: "text-teal-600",
    border: "border-teal-200",
    gradient: "from-teal-500 to-cyan-600",
    shadow: "shadow-teal-500/20",
  },
};

export default function Redeem() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [redemptions, setRedemptions] = useState([]);
  const [processing, setProcessing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRedeemed, setLastRedeemed] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, redemptionsRes] = await Promise.all([
        api.get("/user/profile"),
        api.get("/user/redemptions"),
      ]);
      setBalance(profileRes.data.user.tokenBalance || 0);
      setRedemptions(redemptionsRes.data.redemptions || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (balance < reward.cost) return;

    setProcessing(reward.id);
    try {
      await api.post("/user/redeem", {
        rewardId: reward.id,
        amount: reward.cost,
      });
      setBalance((prev) => prev - reward.cost);
      setLastRedeemed(reward);
      setCelebrationMessage(`🎉 ${reward.name} Redeemed!`);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
      fetchData();
    } catch (error) {
      console.error("Redemption failed:", error);
      alert("Redemption failed. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const filteredRewards = REWARDS.filter((reward) => {
    const matchesCategory =
      selectedCategory === "all" || reward.category === selectedCategory;
    const matchesSearch =
      reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalSaved = redemptions.reduce((acc, r) => acc + (r.amount || 0), 0);
  const totalRedemptions = redemptions.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RewardsSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
      <Navbar />

      {/* Celebration Modal with Confetti */}
      <CelebrationModal
        show={showCelebration}
        onClose={() => setShowCelebration(false)}
        title="Redemption Successful! 🎉"
        message={`You've redeemed ${lastRedeemed?.name}! Check your email for details.`}
        icon={Gift}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Rewards Store</h1>
          </div>
          <p className="text-gray-500">
            Turn your eco-efforts into amazing rewards
          </p>
        </motion.div>

        {/* Stats Section - Enhanced */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Balance Card - Featured */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 rounded-2xl p-6 shadow-xl shadow-green-500/25"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
            <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-white/80" />
                  <span className="text-white/80 text-sm font-medium">
                    Available Balance
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">
                    {balance.toLocaleString()}
                  </span>
                  <span className="text-white/80 text-lg">tokens</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 text-white/90 text-sm bg-white/20 px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12% this month</span>
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Total Redeemed */}
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-2xl p-6 shadow-lg shadow-purple-100/50 border border-purple-100 group hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {totalRedemptions}
            </div>
            <div className="text-sm text-gray-500">Total Redemptions</div>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              <span>Active user</span>
            </div>
          </motion.div>

          {/* Tokens Spent */}
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-2xl p-6 shadow-lg shadow-emerald-100/50 border border-emerald-100 group hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {totalSaved.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Tokens Redeemed</div>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
              <Award className="w-3 h-3" />
              <span>Great progress!</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 mb-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-gray-600">
                <strong className="text-gray-900">{REWARDS.length}</strong>{" "}
                rewards available
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-emerald-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-gray-600">
                <strong className="text-gray-900">50</strong> tokens = $5 value
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-emerald-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-600">
                Instant delivery on digital rewards
              </span>
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-white text-gray-600 border-2 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Rewards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
        >
          {filteredRewards.map((reward, index) => {
            const colors = colorMap[reward.color];
            const Icon = reward.icon;
            const canAfford = balance >= reward.cost;

            return (
              <motion.div
                key={reward.id}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className={`group relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  canAfford
                    ? "border-gray-100 hover:border-emerald-200 hover:shadow-xl"
                    : "border-gray-100 opacity-75"
                }`}
              >
                {/* Badge */}
                {reward.badge && (
                  <div
                    className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${colors.gradient}`}
                  >
                    {reward.badge}
                  </div>
                )}

                {/* Header */}
                <div
                  className={`relative h-32 bg-gradient-to-br ${colors.gradient} overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full" />
                  <div className="relative h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors">
                    {reward.name}
                  </h3>

                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {reward.description}
                  </p>

                  {/* Cost */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 ${colors.bgLight} rounded-lg flex items-center justify-center`}
                      >
                        <Sparkles className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 text-lg">
                          {reward.cost}
                        </span>
                        <span className="text-gray-400 text-sm ml-1">
                          tokens
                        </span>
                      </div>
                    </div>
                    {reward.savings && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                        Save {reward.savings}
                      </span>
                    )}
                  </div>

                  {/* Progress indicator for unaffordable items */}
                  {!canAfford && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-gray-600 font-medium">
                          {Math.round((balance / reward.cost) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all`}
                          style={{
                            width: `${Math.min(
                              (balance / reward.cost) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Button */}
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={processing === reward.id || !canAfford}
                    className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 ${
                      canAfford
                        ? `bg-gradient-to-r ${colors.gradient} text-white hover:shadow-lg ${colors.shadow} hover:scale-[1.02] active:scale-[0.98]`
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {processing === reward.id ? (
                      <span className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : canAfford ? (
                      <>
                        Redeem Now <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    ) : (
                      <span>Need {reward.cost - balance} more</span>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredRewards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No rewards found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}

        {/* Redemption History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/20">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Redemption History
                </h2>
                <p className="text-sm text-gray-500">
                  {redemptions.length} total redemptions •{" "}
                  {totalSaved.toLocaleString()} tokens spent
                </p>
              </div>
            </div>
          </div>

          {redemptions.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {redemptions.slice(0, 5).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                      <Gift className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {item.rewardName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-red-500 font-bold text-lg">
                      -{item.amount}
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-b from-gray-50/50 to-white">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No redemptions yet
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Start earning tokens by recycling and redeem them for amazing
                rewards!
              </p>
            </div>
          )}

          {redemptions.length > 5 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button className="w-full py-3 text-emerald-600 font-semibold hover:bg-emerald-50 rounded-xl transition-colors flex items-center justify-center gap-2">
                View All Redemptions
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
