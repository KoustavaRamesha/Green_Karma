import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Leaf, LogOut, Home, Award, Link2, Coins, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBlockchain } from '../providers/BlockchainProvider';
import { NetworkBadge } from './BlockchainComponents';
import { NotificationsPanel } from './CertificateComponents';
import api from '../lib/api';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const { tokenBalance, isConnected, isRegistered } = useBlockchain();
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);

        if (userData && userData.uid) {
            fetchUnreadCount();
            // Poll for notifications every minute
            const interval = setInterval(fetchUnreadCount, 60000);
            return () => clearInterval(interval);
        }
    }, [user?.uid]);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            setUnreadCount(response.data.count || 0);
        } catch (error) {
            // Silent fail
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        router.push('/');
    };

    return (
        <>
            <nav className="glass border-b border-green-100 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <Link href="/" className="flex items-center space-x-2">
                                <Leaf className="w-8 h-8 text-green-600" />
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                                    Green Karma
                                </span>
                            </Link>

                            <div className="hidden md:flex items-center space-x-4">
                                <Link
                                    href="/dashboard"
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                        ${router.pathname === '/dashboard'
                                            ? 'bg-green-50 text-green-700'
                                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    href="/redeem"
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                        ${router.pathname === '/redeem'
                                            ? 'bg-green-50 text-green-700'
                                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    <Award className="w-4 h-4" />
                                    <span>Rewards</span>
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Blockchain Network Badge */}
                            <div className="hidden lg:block">
                                <NetworkBadge />
                            </div>

                            {/* On-Chain Token Balance */}
                            {isConnected && isRegistered && (
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-semibold shadow-md">
                                    <Coins className="w-4 h-4" />
                                    <span>{tokenBalance.toFixed(2)}</span>
                                    <span className="text-green-100">CARB</span>
                                </div>
                            )}

                            {/* Notification Bell */}
                            <button
                                onClick={() => {
                                    setShowNotifications(true);
                                    setUnreadCount(0); // Optimistically clear count
                                }}
                                className="relative p-2 text-gray-600 hover:text-green-600 transition-colors rounded-full hover:bg-green-50"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {user && (
                                <span className="text-sm text-gray-600 hidden sm:block">
                                    Welcome, {user.name}
                                </span>
                            )}
                            <ConnectButton showBalance={false} chainStatus="icon" />
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <NotificationsPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </>
    );
}

