import { useBlockchain } from '../providers/BlockchainProvider';
import { motion } from 'framer-motion';
import {
    Coins, Users, Shield, FileCheck,
    ExternalLink, Wallet, RefreshCw, Link2
} from 'lucide-react';
import { useState } from 'react';

// Network Badge showing current blockchain network
export function NetworkBadge() {
    const { isCorrectNetwork, chainId, switchToCorrectNetwork, isConnected } = useBlockchain();

    if (!isConnected) return null;

    return (
        <div className="flex items-center gap-2">
            {isCorrectNetwork ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Hardhat Local
                </span>
            ) : (
                <button
                    onClick={switchToCorrectNetwork}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition"
                >
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    Wrong Network - Click to Switch
                </button>
            )}
        </div>
    );
}

// Token Balance Display
export function TokenBalance({ className = '' }) {
    const { tokenBalance, isConnected, refreshUserData, loading } = useBlockchain();

    if (!isConnected) return null;

    return (
        <motion.div
            className={`flex items-center gap-2 ${className}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg">
                <Coins className="w-5 h-5" />
                <span className="font-bold">{tokenBalance.toFixed(2)}</span>
                <span className="text-green-100 text-sm">CARB</span>
            </div>
            <button
                onClick={refreshUserData}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-full transition"
            >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </motion.div>
    );
}

// Blockchain Stats Card
export function BlockchainStatsCard() {
    const { blockchainStats, refreshStats, loading } = useBlockchain();

    const stats = [
        {
            label: 'Total Users',
            value: blockchainStats.totalUsers,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
        },
        {
            label: 'Verifiers',
            value: blockchainStats.totalVerifiers,
            icon: Shield,
            color: 'from-purple-500 to-purple-600',
        },
        {
            label: 'Recycling Records',
            value: blockchainStats.totalRecords,
            icon: FileCheck,
            color: 'from-green-500 to-green-600',
        },
        {
            label: 'Tokens Issued',
            value: blockchainStats.totalTokensIssued.toFixed(2),
            icon: Coins,
            color: 'from-amber-500 to-amber-600',
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Link2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">On-Chain Statistics</h3>
                            <p className="text-gray-300 text-sm">Live data from smart contracts</p>
                        </div>
                    </div>
                    <button
                        onClick={refreshStats}
                        disabled={loading}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                    >
                        <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center"
                    >
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                            <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// Transaction Link Component
export function TransactionLink({ txHash, chainId = 1337 }) {
    const { getExplorerUrl, formatTxHash } = useBlockchain();
    const url = getExplorerUrl(txHash, chainId);

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="font-mono text-gray-600">{formatTxHash(txHash)}</span>
            {url && (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            )}
        </div>
    );
}

// Wallet Connection Button
export function WalletButton() {
    const {
        address,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        connectors,
        tokenBalance
    } = useBlockchain();
    const [showDropdown, setShowDropdown] = useState(false);

    if (isConnected) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition"
                >
                    <Wallet className="w-4 h-4" />
                    <span className="font-mono text-sm">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                    <span className="text-green-400 font-bold">{tokenBalance.toFixed(2)} CARB</span>
                </button>

                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                    >
                        <button
                            onClick={() => {
                                disconnect();
                                setShowDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition"
                        >
                            Disconnect Wallet
                        </button>
                    </motion.div>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg"
        >
            <Wallet className="w-4 h-4" />
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
    );
}

// User Blockchain Records List
export function UserBlockchainRecords() {
    const { userRecords, isConnected, isRegistered, loading } = useBlockchain();

    if (!isConnected || !isRegistered) return null;

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (userRecords.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <FileCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No blockchain records yet</p>
                <p className="text-sm">Start recycling to earn Carbon Tokens!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
                <Link2 className="w-5 h-5 text-green-600" />
                Your On-Chain Records
            </h3>
            <div className="space-y-3">
                {userRecords.map((record) => (
                    <motion.div
                        key={record.recordId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-sm font-medium text-gray-500">Record #{record.recordId}</span>
                                <div className="font-bold text-lg">{record.category}</div>
                                <div className="text-sm text-gray-600">{record.weight}g</div>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${record.verified
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {record.verified ? 'Verified ✓' : 'Pending'}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                    {record.timestamp.toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default {
    NetworkBadge,
    TokenBalance,
    BlockchainStatsCard,
    TransactionLink,
    WalletButton,
    UserBlockchainRecords,
};
