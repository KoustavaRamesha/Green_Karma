import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Leaf, Home, Upload, History, Award, User,
    TrendingUp, Recycle, Coins, Calendar, X, Trophy
} from 'lucide-react';
import { userAPI, wasteAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import { CertificatesGallery } from '../components/CertificateComponents';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [qrModal, setQrModal] = useState({ open: false, qrCode: null, submission: null });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await userAPI.getDashboard();
            setStats(response.data.stats);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleShowQR = async (submissionId) => {
        try {
            setQrModal({ open: true, qrCode: null, submission: null });
            const response = await wasteAPI.getSubmission(submissionId);
            const submission = response.data.submission;
            setQrModal({
                open: true,
                qrCode: submission.qrCode,
                submission
            });
        } catch (error) {
            console.error('Failed to fetch QR code:', error);
            toast.error('Failed to load QR code');
            setQrModal({ open: false, qrCode: null, submission: null });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const chartData = stats?.categoryBreakdown ? [
        { name: 'Plastic', value: stats.categoryBreakdown.Plastic || 0 },
        { name: 'Paper', value: stats.categoryBreakdown.Paper || 0 },
        { name: 'Metal', value: stats.categoryBreakdown.Metal || 0 },
        { name: 'E-waste', value: stats.categoryBreakdown.EWaste || 0 },
        { name: 'Organic', value: stats.categoryBreakdown.Organic || 0 },
    ] : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'overview'
                                        ? 'bg-gradient-green text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Home className="w-5 h-5" />
                                    <span>Overview</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('submit')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'submit'
                                        ? 'bg-gradient-green text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Upload className="w-5 h-5" />
                                    <span>Submit Waste</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'history'
                                        ? 'bg-gradient-green text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <History className="w-5 h-5" />
                                    <span>History</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('rewards')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'rewards'
                                        ? 'bg-gradient-green text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Award className="w-5 h-5" />
                                    <span>Rewards</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'profile'
                                        ? 'bg-gradient-green text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <User className="w-5 h-5" />
                                    <span>Profile</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('achievements')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'achievements'
                                        ? 'bg-gradient-green text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Trophy className="w-5 h-5" />
                                    <span>Achievements</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'achievements' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold bg-gradient-green bg-clip-text text-transparent">
                                    My Achievements & Certificates
                                </h2>
                                <p className="text-gray-600">
                                    Earn blockchain-verified certificates for your recycling contributions.
                                </p>
                                <CertificatesGallery />
                            </div>
                        )}

                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="stat-card">
                                        <div className="flex items-center justify-between mb-2">
                                            <Coins className="w-8 h-8" />
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <div className="text-3xl font-bold mb-1">
                                            {stats?.totalTokens?.toFixed(2) || 0}
                                        </div>
                                        <div className="text-white/80">Carbon Tokens</div>
                                    </div>

                                    <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600">
                                        <div className="flex items-center justify-between mb-2">
                                            <Recycle className="w-8 h-8" />
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <div className="text-3xl font-bold mb-1">
                                            {Number(stats?.totalRecycled || 0).toFixed(2)} kg
                                        </div>
                                        <div className="text-white/80">Total Recycled</div>
                                    </div>

                                    <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-600">
                                        <div className="flex items-center justify-between mb-2">
                                            <Calendar className="w-8 h-8" />
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <div className="text-3xl font-bold mb-1">
                                            {stats?.verifiedSubmissions || 0}
                                        </div>
                                        <div className="text-white/80">Verified Submissions</div>
                                    </div>
                                </div>

                                {/* Category Breakdown Chart */}
                                <div className="card">
                                    <h3 className="text-xl font-bold mb-4">Recycling by Category</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Recent Activity */}
                                <div className="card">
                                    <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                                    <div className="space-y-3">
                                        {stats?.recentActivity?.length > 0 ? (
                                            stats.recentActivity.map((activity, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => activity.status === 'pending' ? handleShowQR(activity.id) : null}
                                                    className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg ${activity.status === 'pending'
                                                        ? 'cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all'
                                                        : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.status === 'verified' ? 'bg-green-100' :
                                                            activity.status === 'pending' ? 'bg-yellow-100' :
                                                                'bg-red-100'
                                                            }`}>
                                                            <Recycle className={`w-5 h-5 ${activity.status === 'verified' ? 'text-green-600' :
                                                                activity.status === 'pending' ? 'text-yellow-600' :
                                                                    'text-red-600'
                                                                }`} />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{activity.category}</div>
                                                            <div className="text-sm text-gray-600">
                                                                {activity.weight} kg • {new Date(activity.date).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-primary-600">
                                                            +{activity.reward?.toFixed(2) || 0} CARB
                                                        </div>
                                                        <div className={`text-xs badge ${activity.status === 'verified' ? 'badge-success' :
                                                            activity.status === 'pending' ? 'badge-warning' :
                                                                'badge-error'
                                                            }`}>
                                                            {activity.status}
                                                            {activity.status === 'pending' && ' - Click for QR'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500 py-8">No recent activity</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'submit' && <SubmitWasteTab onSuccess={fetchDashboardData} />}
                        {activeTab === 'history' && <HistoryTab />}
                        {activeTab === 'rewards' && <RewardsTab stats={stats} />}
                        {activeTab === 'profile' && <ProfileTab user={user} />}
                    </div>
                </div>
            </div >

            {/* QR Code Modal */}
            < AnimatePresence >
                {
                    qrModal.open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => setQrModal({ open: false, qrCode: null, submission: null })}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">QR Code for Verification</h3>
                                    <button
                                        onClick={() => setQrModal({ open: false, qrCode: null, submission: null })}
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
                                            <p className="text-xs text-gray-600 mb-1 font-medium">SUBMISSION ID</p>
                                            <p className="font-mono text-sm font-bold text-gray-900 break-all select-all">
                                                {qrModal.submission?.id}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                📋 Tap to select and copy
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                            <p className="text-sm text-gray-600 mb-1">Category</p>
                                            <p className="font-semibold text-gray-900">{qrModal.submission?.category}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Weight</p>
                                            <p className="font-semibold text-gray-900">{qrModal.submission?.weight} kg</p>
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
                    )
                }
            </AnimatePresence >
        </div >
    );
}

// Submit Waste Tab Component
function SubmitWasteTab({ onSuccess }) {
    const [formData, setFormData] = useState({
        category: 'Plastic',
        weight: '',
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [submissionData, setSubmissionData] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('category', formData.category);
            data.append('weight', formData.weight);
            if (formData.image) {
                data.append('image', formData.image);
            }

            const response = await wasteAPI.submit(data);
            setSubmissionData(response.data.submission);
            toast.success('Waste submitted successfully!');
            onSuccess();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Failed to submit waste');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-6">Submit Recycling Waste</h2>

            {submissionData ? (
                <div className="text-center">
                    <div className="mb-4">
                        <img src={submissionData.qrCode} alt="QR Code" className="mx-auto w-64 h-64" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Submission Successful!</h3>

                    {/* Submission ID Display */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 mb-4 max-w-md mx-auto">
                        <p className="text-xs text-gray-600 mb-1 font-medium">YOUR SUBMISSION ID</p>
                        <p className="font-mono text-sm font-bold text-gray-900 break-all select-all">
                            {submissionData.id}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            📋 Save this ID for your records
                        </p>
                    </div>

                    <p className="text-gray-600 mb-4">Show this QR code to a verifier</p>
                    <button
                        onClick={() => setSubmissionData(null)}
                        className="btn-primary"
                    >
                        Submit Another
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Waste Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="input-field"
                        >
                            <option value="Plastic">Plastic (5 tokens/kg)</option>
                            <option value="Paper">Paper (3 tokens/kg)</option>
                            <option value="Metal">Metal (4 tokens/kg)</option>
                            <option value="EWaste">E-waste (12 tokens/kg)</option>
                            <option value="Organic">Organic (1 token/kg)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            className="input-field"
                            placeholder="Enter weight in kilograms"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Photo (Optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                            className="input-field"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Waste'}
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
            console.error('History fetch error:', error);
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="card">Loading...</div>;
    }

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-6">Recycling History</h2>
            <div className="space-y-4">
                {history.length > 0 ? (
                    history.map((item) => (
                        <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-bold text-lg">{item.category}</div>
                                    <div className="text-sm text-gray-600">
                                        {item.actualWeight || item.weight} kg
                                    </div>
                                </div>
                                <div className={`badge ${item.status === 'verified' ? 'badge-success' :
                                    item.status === 'pending' ? 'badge-warning' :
                                        'badge-error'
                                    }`}>
                                    {item.status}
                                </div>
                            </div>
                            {item.status === 'verified' && (
                                <div className="text-primary-600 font-bold">
                                    Earned: {item.rewardAmount?.toFixed(2)} CARB
                                </div>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                                {new Date(item.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No history yet</p>
                )}
            </div>
        </div>
    );
}

// Rewards Tab Component
function RewardsTab({ stats }) {
    return (
        <div className="space-y-6">
            <div className="card">
                <h2 className="text-2xl font-bold mb-6">Your Rewards</h2>
                <div className="text-center py-8">
                    <div className="text-6xl font-bold text-gradient mb-4">
                        {stats?.totalTokens?.toFixed(2) || 0}
                    </div>
                    <div className="text-xl text-gray-600 mb-8">Carbon Tokens</div>
                    <Link href="/redeem" className="btn-primary inline-flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Browse Rewards Marketplace
                    </Link>
                </div>
            </div>

            <div className="card">
                <h3 className="text-xl font-bold mb-4">Reward Rates</h3>
                <div className="space-y-3">
                    {[
                        { name: 'Plastic', rate: 5 },
                        { name: 'Paper', rate: 3 },
                        { name: 'Metal', rate: 4 },
                        { name: 'E-waste', rate: 12 },
                        { name: 'Organic', rate: 1 }
                    ].map((item) => (
                        <div key={item.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-primary-600 font-bold">{item.rate} tokens/kg</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Profile Tab Component
function ProfileTab({ user }) {
    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-6">Profile</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <div className="font-medium">{user?.name}</div>
                </div>
                <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <div className="font-medium">{user?.email}</div>
                </div>
                <div>
                    <label className="text-sm text-gray-600">Wallet Address</label>
                    <div className="font-mono text-sm">{user?.walletAddress}</div>
                </div>
                <div>
                    <label className="text-sm text-gray-600">Role</label>
                    <div className="font-medium capitalize">{user?.role}</div>
                </div>
            </div>
        </div>
    );
}
