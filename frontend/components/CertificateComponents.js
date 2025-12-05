import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award, Bell, Trophy, Shield, Star,
    X, Check, ChevronRight, ExternalLink,
    Download, Share2, BadgeCheck, Leaf
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../lib/api';

// Certificate tier colors
const TIER_COLORS = {
    BRONZE: {
        bg: 'from-amber-700 to-amber-900',
        border: 'border-amber-500',
        text: 'text-amber-100',
        badge: 'bg-amber-500',
    },
    SILVER: {
        bg: 'from-slate-400 to-slate-600',
        border: 'border-slate-400',
        text: 'text-slate-100',
        badge: 'bg-slate-400',
    },
    GOLD: {
        bg: 'from-yellow-500 to-yellow-700',
        border: 'border-yellow-400',
        text: 'text-yellow-100',
        badge: 'bg-yellow-400',
    },
    PLATINUM: {
        bg: 'from-purple-600 to-purple-900',
        border: 'border-purple-400',
        text: 'text-purple-100',
        badge: 'bg-purple-400',
    }
};

// Single Certificate Card
export function CertificateCard({ certificate, onView }) {
    const tier = TIER_COLORS[certificate.certificateType] || TIER_COLORS.BRONZE;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tier.bg} p-6 shadow-xl cursor-pointer`}
            onClick={() => onView?.(certificate)}
        >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            {/* Badge */}
            <div className={`absolute top-4 right-4 ${tier.badge} text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg`}>
                {certificate.certificateType}
            </div>

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold ${tier.text}`}>Green Karma</h3>
                        <p className="text-white/80 text-sm">Certificate of Achievement</p>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-white/90">
                        <Award className="w-4 h-4" />
                        <span>{((certificate.totalWeight || certificate.weight * 1000) / 1000).toFixed(1)} kg Recycled</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                        <Star className="w-4 h-4" />
                        <span>{certificate.category}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="text-xs text-white/70">
                        Token #{certificate.tokenId}
                    </div>
                    <div className="flex items-center gap-1 text-white/90 text-sm">
                        <BadgeCheck className="w-4 h-4" />
                        <span>On-Chain Verified</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Certificate Detail Modal (Tamper Proof Design)
export function CertificateModal({ certificate, onClose }) {
    if (!certificate) return null;

    const tier = TIER_COLORS[certificate.certificateType] || TIER_COLORS.BRONZE;
    
    // Get blockchain explorer URL based on network (assuming Sepolia or similar)
    const explorerUrl = process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER || 'https://sepolia.etherscan.io';
    const verificationUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/verify/${certificate.tokenId}?tx=${certificate.txHash || ''}`
        : `https://greenkarma.com/verify/${certificate.tokenId}?tx=${certificate.txHash || ''}`;
    
    const issueDate = certificate.issuedAt 
        ? new Date(certificate.issuedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Pending';

    const handleDownload = () => {
        // Create a canvas to render the certificate for download
        const certElement = document.getElementById('certificate-content');
        if (!certElement) return;
        
        // Use html2canvas or similar library for PDF generation
        // For now, just open in new window for printing
        window.print();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white relative max-w-5xl w-full shadow-2xl overflow-hidden my-8 print:shadow-none"
                    style={{ aspectRatio: '1.414/1' }} // A4 aspect ratio for printing
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Ornamental Border with Watermark Pattern */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-24 h-24 border-l-4 border-t-4 border-amber-600/30"></div>
                        <div className="absolute top-0 right-0 w-24 h-24 border-r-4 border-t-4 border-amber-600/30"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 border-l-4 border-b-4 border-amber-600/30"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 border-r-4 border-b-4 border-amber-600/30"></div>
                        
                        {/* Diagonal watermark pattern */}
                        <div className="absolute inset-0 opacity-5" style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(34, 197, 94, 0.1) 35px, rgba(34, 197, 94, 0.1) 70px)'
                        }}></div>
                    </div>

                    {/* Main Border */}
                    <div className="absolute inset-3 border-4 border-amber-600 pointer-events-none z-10 rounded-sm"></div>
                    <div className="absolute inset-5 border-2 border-amber-700/40 pointer-events-none z-10 rounded-sm"></div>

                    {/* Gradient Background with pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-emerald-50 z-0"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.1)_0%,_transparent_50%)] z-0"></div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/90 hover:bg-white rounded-full z-50 transition shadow-lg print:hidden"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Action Buttons */}
                    <div className="absolute top-6 left-6 flex gap-2 z-50 print:hidden">
                        <button
                            onClick={handleDownload}
                            className="p-2 bg-white/90 hover:bg-white rounded-full transition shadow-lg"
                            title="Download Certificate"
                        >
                            <Download className="w-5 h-5 text-gray-600" />
                        </button>
                        {certificate.txHash && (
                            <a
                                href={`${explorerUrl}/tx/${certificate.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/90 hover:bg-white rounded-full transition shadow-lg"
                                title="View on Blockchain Explorer"
                            >
                                <ExternalLink className="w-5 h-5 text-gray-600" />
                            </a>
                        )}
                    </div>

                    {/* Certificate Content */}
                    <div id="certificate-content" className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-center print:p-8">

                        {/* Header with Logo */}
                        <div className="mb-6">
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <div className="relative">
                                    <Leaf className="w-10 h-10 text-green-700" />
                                    <div className="absolute inset-0 w-10 h-10 text-green-500/30 animate-pulse">
                                        <Leaf className="w-10 h-10" />
                                    </div>
                                </div>
                                <span className="text-2xl font-bold text-green-800 tracking-widest uppercase">
                                    Green Karma Initiative
                                </span>
                            </div>
                            <div className="w-32 h-1 bg-gradient-to-r from-green-600 via-amber-600 to-green-600 mx-auto mb-3"></div>
                            <h1 className="text-5xl font-serif font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                                Certificate of Recognition
                            </h1>
                            <p className="text-amber-700 font-serif italic text-lg">
                                Blockchain-Verified Achievement Certificate
                            </p>
                        </div>

                        {/* Main Body */}
                        <div className="mb-8 max-w-3xl">
                            <p className="text-gray-700 mb-5 font-serif text-xl">
                                This is to certify that
                            </p>
                            <h2 className="text-4xl font-bold text-gray-900 mb-5 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                                <span className="decoration-amber-500 underline decoration-3 underline-offset-8">
                                    {certificate.recipientName || certificate.recipient || 'Green Karma Benefactor'}
                                </span>
                            </h2>
                            <p className="text-gray-700 mb-6 font-serif text-lg leading-relaxed">
                                has demonstrated exceptional commitment to environmental sustainability by successfully recycling
                                <span className="font-bold text-green-700 mx-2 text-2xl">
                                    {((certificate.totalWeight || certificate.weight * 1000) / 1000).toFixed(1)} kg
                                </span>
                                of
                                <span className="font-bold text-green-700 mx-2 text-xl">
                                    {certificate.category}
                                </span>
                                waste material, thereby earning the prestigious designation of
                            </p>
                            <div className="inline-block px-8 py-4 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-2 border-amber-300 rounded-lg shadow-lg">
                                <span className={`text-3xl font-bold ${tier.text || 'text-amber-900'} tracking-wide uppercase`}>
                                    {certificate.certificateType} Tier Recycler
                                </span>
                            </div>
                        </div>

                        {/* Footer / Verification Section */}
                        <div className="w-full flex items-end justify-between mt-auto px-8 border-t-2 border-amber-300 pt-6">

                            {/* Issuer Signature */}
                            <div className="text-center flex-1">
                                <div className="font-cursive text-xl text-gray-800 mb-2" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                                    Green Karma DAO
                                </div>
                                <div className="w-40 h-px bg-gray-400 mb-2 mx-auto"></div>
                                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Authorized Issuer</p>
                            </div>

                            {/* Official Seal */}
                            <div className="relative mx-8">
                                <div className={`w-36 h-36 ${tier.badge || 'bg-amber-600'} rounded-full flex items-center justify-center shadow-2xl text-white p-3`}>
                                    <div className="w-full h-full border-3 border-white/80 rounded-full flex items-center justify-center border-double">
                                        <div className="text-center">
                                            <Shield className="w-10 h-10 mx-auto mb-1" />
                                            <div className="text-xs font-bold uppercase tracking-widest">Blockchain<br />Verified</div>
                                        </div>
                                    </div>
                                </div>
                                {certificate.txHash && (
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-[8px] font-mono text-gray-600 whitespace-nowrap">
                                        ✓ Verified
                                    </div>
                                )}
                            </div>

                            {/* Verifier Signature */}
                            {certificate.verifierName && (
                                <div className="text-center flex-1">
                                    <div className="font-cursive text-xl text-gray-800 mb-2" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                                        {certificate.verifierName}
                                    </div>
                                    <div className="w-40 h-px bg-gray-400 mb-2 mx-auto"></div>
                                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Certified Verifier</p>
                                    {certificate.verifierWallet && (
                                        <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                            {certificate.verifierWallet.slice(0, 6)}...{certificate.verifierWallet.slice(-4)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* QR Code and Verification Section */}
                        <div className="mt-6 flex items-center justify-center gap-8">
                            <div className="text-center">
                                <p className="text-xs uppercase font-bold text-gray-500 mb-2">Scan to Verify Authenticity</p>
                                <div className="bg-white p-3 border-2 border-gray-300 inline-block rounded-lg shadow-lg">
                                    <QRCodeSVG 
                                        value={verificationUrl} 
                                        size={100}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tamper-Proof Digital Fingerprint */}
                        <div className="mt-6 w-full max-w-4xl mx-auto bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-4 font-mono text-xs text-gray-600">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span className="font-bold text-gray-800 uppercase">Tamper-Proof Blockchain Verification</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                                {certificate.txHash && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Transaction Hash:</span>
                                        <div className="break-all text-gray-600">{certificate.txHash}</div>
                                    </div>
                                )}
                                <div>
                                    <span className="font-semibold text-gray-700">Certificate Token ID:</span>
                                    <div className="text-gray-600">#{certificate.tokenId}</div>
                                </div>
                                {certificate.blockNumber && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Block Number:</span>
                                        <div className="text-gray-600">#{certificate.blockNumber}</div>
                                    </div>
                                )}
                                <div>
                                    <span className="font-semibold text-gray-700">Issued Date:</span>
                                    <div className="text-gray-600">{issueDate}</div>
                                </div>
                                {certificate.recipient && (
                                    <div className="md:col-span-2">
                                        <span className="font-semibold text-gray-700">Recipient Wallet:</span>
                                        <div className="break-all text-gray-600">{certificate.recipient}</div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-300 text-center">
                                <p className="text-[10px] text-gray-500">
                                    This certificate is permanently recorded on the Ethereum blockchain and cannot be altered or forged.
                                    <br />
                                    All data is cryptographically secured and verifiable through blockchain explorers.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Notifications Panel
export function NotificationsPanel({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-40"
                onClick={onClose}
            />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Notifications</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={markAllAsRead}
                            className="mt-2 text-sm text-white/80 hover:text-white transition"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto h-[calc(100%-80px)]">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                            <Bell className="w-12 h-12 mb-3 text-gray-300" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 hover:bg-gray-50 transition cursor-pointer ${!notification.read ? 'bg-green-50' : ''
                                        }`}
                                    onClick={() => {
                                        if (!notification.read) {
                                            markAsRead(notification.id);
                                        }
                                        if (notification.type === 'certificate' && notification.certificateData) {
                                            setSelectedCertificate(notification.certificateData);
                                        }
                                    }}
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'certificate'
                                            ? 'bg-yellow-100 text-yellow-600'
                                            : 'bg-green-100 text-green-600'
                                            }`}>
                                            {notification.type === 'certificate' ? (
                                                <Trophy className="w-5 h-5" />
                                            ) : (
                                                <Bell className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Certificate Modal */}
            {selectedCertificate && (
                <CertificateModal
                    certificate={selectedCertificate}
                    onClose={() => setSelectedCertificate(null)}
                />
            )}
        </>
    );
}

// Certificates Gallery
export function CertificatesGallery() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications/certificates');
            setCertificates(response.data.certificates || []);
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
        );
    }

    if (certificates.length === 0) {
        return (
            <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Certificates Yet</h3>
                <p className="text-gray-500">
                    Recycle 40kg or more in a single donation to earn your first certificate!
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="p-4 bg-amber-50 rounded-xl text-center">
                        <p className="text-amber-800 font-bold">Bronze</p>
                        <p className="text-amber-600 text-sm">40+ kg</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <p className="text-slate-700 font-bold">Silver</p>
                        <p className="text-slate-600 text-sm">100+ kg</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-xl text-center">
                        <p className="text-yellow-700 font-bold">Gold</p>
                        <p className="text-yellow-600 text-sm">500+ kg</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-center">
                        <p className="text-purple-700 font-bold">Platinum</p>
                        <p className="text-purple-600 text-sm">1000+ kg</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="grid md:grid-cols-2 gap-6">
                {certificates.map((cert, index) => (
                    <CertificateCard
                        key={cert.tokenId || index}
                        certificate={cert}
                        onView={setSelectedCertificate}
                    />
                ))}
            </div>

            {selectedCertificate && (
                <CertificateModal
                    certificate={selectedCertificate}
                    onClose={() => setSelectedCertificate(null)}
                />
            )}
        </>
    );
}

export default {
    CertificateCard,
    CertificateModal,
    NotificationsPanel,
    CertificatesGallery
};

