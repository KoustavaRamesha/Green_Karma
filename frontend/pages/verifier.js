import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Leaf, QrCode, CheckCircle, XCircle, LogOut, Trophy } from 'lucide-react';
import { verifierAPI } from '../lib/api';
import toast from 'react-hot-toast';
import QRScanner from '../components/QRScanner';

export default function Verifier() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingSubmissions, setPendingSubmissions] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [scanMode, setScanMode] = useState(false);
    const [qrInput, setQrInput] = useState('');
    const [showCamera, setShowCamera] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        if (!token || userData.role !== 'verifier') {
            router.push('/login');
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
            console.error('Fetch pending error:', error);
            toast.error('Failed to load pending submissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await verifierAPI.getHistory();
            setHistory(response.data.verifications);
        } catch (error) {
            console.error('Fetch history error:', error);
        }
    };

    const handleScanQR = async () => {
        if (!qrInput) {
            toast.error('Please enter submission ID');
            return;
        }

        try {
            const response = await verifierAPI.scanQR(qrInput);
            setSelectedSubmission(response.data.submission);
            setScanMode(false);
            setQrInput('');
            toast.success('Submission found successfully');
        } catch (error) {
            console.error('QR scan error:', error);
            toast.error('Invalid submission ID');
        }
    };

    const handleCameraScan = async (qrData) => {
        try {
            const response = await verifierAPI.scanQR(qrData);
            setSelectedSubmission(response.data.submission);
            setShowCamera(false);
            setScanMode(false);
            toast.success('QR code scanned successfully!');
        } catch (error) {
            console.error('QR scan error:', error);
            toast.error('Invalid QR code');
        }
    };

    const handleVerify = async (submissionId, approved, actualWeight) => {
        try {
            await verifierAPI.verify(submissionId, {
                approved,
                actualWeight: actualWeight || undefined
            });

            toast.success(approved ? 'Submission verified!' : 'Submission rejected');
            setSelectedSubmission(null);
            fetchPendingSubmissions();
            fetchHistory();
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Failed to verify submission');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Navigation */}
            <nav className="glass border-b border-blue-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <Leaf className="w-8 h-8 text-blue-600" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Green Karma Verifier
                            </span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Verifier: {user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-red-600 transition"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'pending'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Pending Verifications ({pendingSubmissions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'history'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Verification History
                    </button>
                </div>

                {/* QR Scanner Section */}
                <div className="mb-6">
                    {/* Helper Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <QrCode className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">✨ How to Verify Submissions</h4>
                                <p className="text-sm text-blue-700">
                                    <strong>Easiest Method:</strong> Scroll down to view all pending submissions below.
                                    Each card shows the user's waste photo and details - just click "Verify Submission" to approve or reject.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setScanMode(!scanMode)}
                        className="btn-primary inline-flex items-center"
                    >
                        <QrCode className="w-5 h-5 mr-2" />
                        {scanMode ? 'Close QR Lookup' : 'Look Up by QR Code'}
                    </button>
                </div>

                {/* QR Scanner */}
                {scanMode && (
                    <div className="card mb-6">
                        <h3 className="text-xl font-bold mb-4">Scan or Lookup Submission</h3>
                        <p className="text-gray-600 mb-6">
                            Choose how you'd like to verify: scan the QR code with your camera or enter the submission ID manually.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {/* Camera Scan Option */}
                            <button
                                onClick={() => setShowCamera(true)}
                                className="p-6 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-all group"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                                        <QrCode className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h4 className="font-semibold text-lg mb-1">Scan with Camera</h4>
                                    <p className="text-sm text-gray-600">
                                        Use your device camera to scan the QR code
                                    </p>
                                </div>
                            </button>

                            {/* Manual Input Option */}
                            <div className="p-6 border-2 border-gray-300 rounded-lg">
                                <h4 className="font-semibold text-lg mb-3">Manual Entry</h4>
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
                                        className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
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
                                    setQrInput('');
                                }}
                                className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Camera QR Scanner */}
                {showCamera && (
                    <QRScanner
                        onScan={handleCameraScan}
                        onClose={() => setShowCamera(false)}
                    />
                )}

                {/* Selected Submission for Verification */}
                {selectedSubmission && (
                    <VerificationModal
                        submission={selectedSubmission}
                        onVerify={handleVerify}
                        onClose={() => setSelectedSubmission(null)}
                    />
                )}

                {/* Pending Submissions */}
                {activeTab === 'pending' && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingSubmissions.length > 0 ? (
                            pendingSubmissions.map((submission) => (
                                <div key={submission.id} className="card hover:shadow-xl transition">
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-lg">{submission.category}</div>
                                                <div className="text-sm text-gray-600">{submission.weight} kg</div>
                                            </div>
                                            <div className="badge badge-warning">Pending</div>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">
                                            User: {submission.user.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(submission.createdAt).toLocaleString()}
                                        </div>
                                    </div>

                                    {submission.imageUrl && (
                                        <img
                                            src={submission.imageUrl}
                                            alt="Waste"
                                            className="w-full h-48 object-cover rounded-lg mb-4"
                                        />
                                    )}

                                    {submission.qrCode && (
                                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                            <img src={submission.qrCode} alt="QR" className="w-32 h-32 mx-auto" />
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setSelectedSubmission(submission)}
                                        className="w-full btn-primary"
                                    >
                                        Verify Submission
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No pending submissions
                            </div>
                        )}
                    </div>
                )}

                {/* Verification History */}
                {activeTab === 'history' && (
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-6">Verification History</h2>
                        <div className="space-y-4">
                            {history.length > 0 ? (
                                history.map((item) => (
                                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold">{item.category}</div>
                                                <div className="text-sm text-gray-600">
                                                    User: {item.user.name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Weight: {item.actualWeight || item.weight} kg
                                                </div>
                                                {item.status === 'verified' && (
                                                    <div className="text-sm text-green-600 font-medium">
                                                        Reward: {item.rewardAmount?.toFixed(2)} CARB
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className={`badge ${item.status === 'verified' ? 'badge-success' : 'badge-error'
                                                    }`}>
                                                    {item.status}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {new Date(item.verifiedAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">No verification history</p>
                            )}
                        </div>
                    </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-2xl font-bold mb-6">Verify Submission</h2>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-sm text-gray-600">User</label>
                        <div className="font-medium">{submission.user.name}</div>
                        <div className="text-sm text-gray-500">{submission.user.email}</div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Category</label>
                        <div className="font-medium">{submission.category}</div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Reported Weight</label>
                        <div className="font-medium">{submission.weight} kg</div>
                    </div>

                    {submission.imageUrl && (
                        <div>
                            <label className="text-sm text-gray-600">Photo</label>
                            <img
                                src={submission.imageUrl}
                                alt="Waste"
                                className="w-full h-64 object-cover rounded-lg mt-2"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-sm text-gray-600 block mb-2">
                            Actual Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={actualWeight}
                            onChange={(e) => setActualWeight(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {/* Certificate Eligibility Indicator */}
                    <div className={`p-4 rounded-lg flex items-center gap-3 transition-colors ${parseFloat(actualWeight) >= 40
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-gray-50 border border-gray-100 opacity-50'
                        }`}>
                        <div className={`p-2 rounded-full ${parseFloat(actualWeight) >= 40 ? 'bg-amber-100' : 'bg-gray-200'
                            }`}>
                            <Trophy className={`w-5 h-5 ${parseFloat(actualWeight) >= 40 ? 'text-amber-600' : 'text-gray-400'
                                }`} />
                        </div>
                        <div>
                            <p className={`font-semibold ${parseFloat(actualWeight) >= 40 ? 'text-amber-900' : 'text-gray-500'
                                }`}>
                                {parseFloat(actualWeight) >= 1000 ? 'Platinum Certificate Eligible' :
                                    parseFloat(actualWeight) >= 500 ? 'Gold Certificate Eligible' :
                                        parseFloat(actualWeight) >= 100 ? 'Silver Certificate Eligible' :
                                            parseFloat(actualWeight) >= 40 ? 'Bronze Certificate Eligible' :
                                                'No Certificate'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {parseFloat(actualWeight) >= 40
                                    ? 'A blockchain NFT will be automatically minted for this user.'
                                    : 'Minimum 40kg required for blockchain certificate.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={loading}
                        className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
                    >
                        <XCircle className="w-5 h-5 mr-2" />
                        Reject
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
