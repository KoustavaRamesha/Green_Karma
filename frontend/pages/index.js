import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
    Leaf, Recycle, Award, TrendingUp, ArrowRight, Sparkles,
    Shield, Link2, Coins, FileCheck, Database, Users, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBlockchain } from '../providers/BlockchainProvider';

export default function Home() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { blockchainStats, isConnected, refreshStats } = useBlockchain();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        refreshStats();
    }, [refreshStats]);

    const features = [
        {
            icon: <Recycle className="w-8 h-8" />,
            title: 'Recycle & Earn',
            description: 'Submit your recycling waste and earn Carbon Tokens verified on blockchain'
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: 'Government Verified',
            description: 'Official verifiers ensure transparency and authenticity of every transaction'
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: 'Track Impact',
            description: 'Monitor your environmental impact and token rewards in real-time'
        },
        {
            icon: <Sparkles className="w-8 h-8" />,
            title: 'Redeem Rewards',
            description: 'Use your Carbon Tokens for exclusive eco-friendly rewards and benefits'
        }
    ];

    // Use real blockchain stats with fallbacks
    const stats = [
        { value: blockchainStats.totalUsers || '0', label: 'On-Chain Users', icon: Users },
        { value: blockchainStats.totalRecords || '0', label: 'Recycling Records', icon: FileCheck },
        { value: `${blockchainStats.totalTokensIssued?.toFixed(0) || '0'}`, label: 'CARB Tokens Minted', icon: Coins },
        { value: blockchainStats.totalVerifiers || '0', label: 'Active Verifiers', icon: Shield }
    ];

    const blockchainFeatures = [
        {
            icon: <Database className="w-6 h-6" />,
            title: 'Immutable Records',
            description: 'Every recycling record is permanently stored on-chain'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Verified Transactions',
            description: 'Government officials verify each submission before token rewards'
        },
        {
            icon: <Coins className="w-6 h-6" />,
            title: 'ERC-20 Carbon Tokens',
            description: 'Earn real tokens that can be transferred, traded, or redeemed'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Instant Rewards',
            description: 'Tokens are minted directly to your wallet upon verification'
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="glass border-b border-green-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <Leaf className="w-8 h-8 text-primary-600" />
                            <span className="text-2xl font-bold text-gradient">Green Karma</span>
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full ml-2">
                                <Link2 className="w-3 h-3" />
                                Blockchain
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition">
                                        Dashboard
                                    </Link>
                                    <ConnectButton />
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-700 hover:text-primary-600 font-medium transition">
                                        Login
                                    </Link>
                                    <Link href="/register" className="btn-primary">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
                                <Link2 className="w-4 h-4" />
                                Powered by Ethereum Smart Contracts
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Recycle Today,
                                <span className="text-gradient"> Earn Forever</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Join the blockchain-powered recycling revolution. Earn <strong>Carbon Tokens (CARB)</strong> for every kilogram you recycle, verified by government officials and recorded permanently on-chain.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/register" className="btn-primary inline-flex items-center justify-center">
                                    Start Recycling
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                                <Link href="/login" className="btn-secondary inline-flex items-center justify-center">
                                    Login
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative w-full h-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                                {/* Blockchain visualization */}
                                <div className="absolute inset-0 opacity-30">
                                    <div className="grid grid-cols-6 gap-4 p-4 h-full">
                                        {[...Array(24)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-full h-8 bg-green-500/20 rounded"
                                                animate={{ opacity: [0.2, 0.6, 0.2] }}
                                                transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <motion.div
                                            className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Link2 className="w-10 h-10 text-white" />
                                        </motion.div>
                                        <div className="text-3xl font-bold text-white mb-2">Green Karma</div>
                                        <div className="text-green-400 font-medium">Smart Contract Ecosystem</div>
                                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            Chain ID: 1337 (Hardhat)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Live Blockchain Stats Section */}
            <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium mb-4">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Live On-Chain Data
                        </div>
                        <h2 className="text-3xl font-bold text-white">Blockchain Statistics</h2>
                        <p className="text-gray-400 mt-2">Real-time data from our deployed smart contracts</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
                            >
                                <div className="w-12 h-12 mx-auto mb-4 bg-green-500/20 rounded-xl flex items-center justify-center">
                                    <stat.icon className="w-6 h-6 text-green-400" />
                                </div>
                                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                                <div className="text-gray-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Smart Contracts Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Blockchain Architecture</h2>
                        <p className="text-xl text-gray-600">Four interconnected smart contracts powering the ecosystem</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                name: 'IdentityContract',
                                description: 'Manages user and verifier registration with role-based access control',
                                icon: '🔐',
                                color: 'from-purple-500 to-purple-600'
                            },
                            {
                                name: 'RecycleRecord',
                                description: 'Records and verifies recycling events with IPFS integration',
                                icon: '📋',
                                color: 'from-blue-500 to-blue-600'
                            },
                            {
                                name: 'CarbonToken',
                                description: 'ERC-20 token for rewarding recycling activities',
                                icon: '🪙',
                                color: 'from-green-500 to-green-600'
                            },
                            {
                                name: 'RewardEngine',
                                description: 'Calculates and distributes token rewards based on waste category',
                                icon: '⚡',
                                color: 'from-amber-500 to-amber-600'
                            }
                        ].map((contract, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${contract.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                                    {contract.icon}
                                </div>
                                <h3 className="font-bold text-lg mb-2 font-mono">{contract.name}</h3>
                                <p className="text-gray-600 text-sm">{contract.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600">Simple, transparent, and rewarding</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="card hover:scale-105 transition-transform duration-300"
                            >
                                <div className="w-16 h-16 bg-gradient-green rounded-xl flex items-center justify-center text-white mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blockchain Benefits */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">Why Blockchain?</h2>
                            <p className="text-xl text-gray-600 mb-8">
                                Traditional recycling programs lack transparency and accountability.
                                Our blockchain solution ensures every recycling action is permanently recorded,
                                verified, and rewarded fairly.
                            </p>
                            <div className="space-y-4">
                                {blockchainFeatures.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <span className="text-green-600">{feature.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-1">{feature.title}</h3>
                                            <p className="text-gray-600">{feature.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white"
                        >
                            <h3 className="text-2xl font-bold mb-6">Reward Rates</h3>
                            <div className="space-y-4">
                                {[
                                    { category: 'E-Waste', rate: 12, color: 'bg-red-400' },
                                    { category: 'Plastic', rate: 5, color: 'bg-blue-400' },
                                    { category: 'Metal', rate: 4, color: 'bg-gray-400' },
                                    { category: 'Paper', rate: 3, color: 'bg-yellow-400' },
                                    { category: 'Organic', rate: 1, color: 'bg-green-400' },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 ${item.color} rounded-full`} />
                                            <span>{item.category}</span>
                                        </div>
                                        <span className="font-bold">{item.rate} CARB/kg</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-white/80 mt-4">
                                * Rates are defined in the RewardEngine smart contract
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-green">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Make a Difference?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Connect your wallet, register on-chain, and start earning Carbon Tokens today
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register" className="bg-white text-primary-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition inline-flex items-center justify-center">
                                Get Started Now
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <ConnectButton.Custom>
                                {({ openConnectModal }) => (
                                    <button
                                        onClick={openConnectModal}
                                        className="bg-white/20 text-white font-bold py-4 px-8 rounded-lg hover:bg-white/30 transition inline-flex items-center justify-center border border-white/30"
                                    >
                                        <Link2 className="mr-2 w-5 h-5" />
                                        Connect Wallet
                                    </button>
                                )}
                            </ConnectButton.Custom>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Leaf className="w-6 h-6" />
                                <span className="text-xl font-bold">Green Karma</span>
                            </div>
                            <p className="text-gray-400">
                                Blockchain-powered recycling rewards platform for a sustainable future.
                            </p>
                            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                                <Link2 className="w-4 h-4" />
                                <span>Powered by Ethereum</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Smart Contracts</h3>
                            <ul className="space-y-2 text-gray-400 text-sm font-mono">
                                <li>IdentityContract</li>
                                <li>RecycleRecordContract</li>
                                <li>CarbonToken (CARB)</li>
                                <li>RewardEngine</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                                <li><Link href="/redeem" className="hover:text-white transition">Redeem Tokens</Link></li>
                                <li><Link href="/verifier" className="hover:text-white transition">Verifier Portal</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Technology</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li>Solidity ^0.8.20</li>
                                <li>OpenZeppelin Contracts</li>
                                <li>Hardhat Framework</li>
                                <li>ethers.js v6</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 Green Karma. All rights reserved. Built with 💚 for a sustainable future.</p>
                        <p className="text-sm mt-2 text-gray-500">Hackathon Submission - Blockchain Domain</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
