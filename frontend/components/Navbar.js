import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Leaf, LogOut, Home, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        router.push('/');
    };

    return (
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
                        {user && (
                            <span className="text-sm text-gray-600 hidden sm:block">
                                Welcome, {user.name}
                            </span>
                        )}
                        <ConnectButton showBalance={false} chainStatus="none" />
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
    );
}
