import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Wallet, Gift, CreditCard, ShoppingBag, ArrowRight, History, Check } from 'lucide-react';
import { userAPI } from '../lib/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const REWARDS = [
    {
        id: 'cash-10',
        type: 'cash',
        name: '$10 Cash Transfer',
        cost: 100,
        description: 'Direct bank transfer or PayPal deposit.',
        icon: Wallet,
        color: 'from-green-500 to-emerald-700'
    },
    {
        id: 'cash-50',
        type: 'cash',
        name: '$50 Cash Transfer',
        cost: 450,
        description: 'Direct bank transfer or PayPal deposit. Save 50 points!',
        icon: Wallet,
        color: 'from-green-600 to-emerald-800'
    },
    {
        id: 'amazon-20',
        type: 'gift_card',
        name: '$20 Amazon Gift Card',
        cost: 200,
        description: 'Shop for anything on Amazon.',
        icon: ShoppingBag,
        color: 'from-yellow-500 to-orange-600'
    },
    {
        id: 'starbucks-15',
        type: 'gift_card',
        name: '$15 Starbucks Card',
        cost: 150,
        description: 'Coffee, tea, and more.',
        icon: Gift,
        color: 'from-green-400 to-green-600'
    },
    {
        id: 'uber-25',
        type: 'voucher',
        name: '$25 Uber Voucher',
        cost: 250,
        description: 'Rides or Uber Eats delivery.',
        icon: CreditCard,
        color: 'from-gray-700 to-black'
    },
    {
        id: 'apple-50',
        type: 'gift_card',
        name: '$50 Apple Gift Card',
        cost: 500,
        description: 'Apps, games, music, and more.',
        icon: Gift,
        color: 'from-blue-500 to-indigo-600'
    }
];

export default function Redeem() {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [redemptions, setRedemptions] = useState([]);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [balanceRes, historyRes] = await Promise.all([
                userAPI.getTokenBalance(),
                userAPI.getRedemptions()
            ]);
            setBalance(balanceRes.data.balance);
            setRedemptions(historyRes.data.redemptions);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load rewards data');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (reward) => {
        if (balance < reward.cost) {
            toast.error('Insufficient points!');
            return;
        }

        if (!confirm(`Redeem ${reward.name} for ${reward.cost} points?`)) return;

        setProcessing(reward.id);
        try {
            await userAPI.redeem({
                amount: reward.cost,
                rewardType: reward.type,
                rewardId: reward.id,
                rewardName: reward.name
            });

            toast.success('Redemption successful! Check your email.');
            fetchData(); // Refresh balance and history
        } catch (error) {
            console.error('Redeem error:', error);
            toast.error(error.response?.data?.error || 'Redemption failed');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>Redeem Rewards | Green Karma</title>
            </Head>

            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-gray-900 mb-4"
                    >
                        Rewards Marketplace
                    </motion.h1>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                        Exchange your hard-earned Carbon Tokens for real-world rewards.
                        Help the planet, treat yourself.
                    </p>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow-lg border border-green-100"
                    >
                        <span className="text-gray-500 mr-2">Your Balance:</span>
                        <span className="text-3xl font-bold text-green-600">{balance}</span>
                        <span className="text-sm text-green-600 ml-1 font-medium">Tokens</span>
                    </motion.div>
                </div>

                {/* Rewards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {REWARDS.map((reward, index) => (
                        <motion.div
                            key={reward.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                        >
                            <div className={`h-32 bg-gradient-to-r ${reward.color} p-6 flex items-center justify-center relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <reward.icon className="w-16 h-16 text-white drop-shadow-md" />
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{reward.name}</h3>
                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md mt-1 uppercase tracking-wider font-medium">
                                            {reward.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-green-600">{reward.cost}</span>
                                        <span className="text-xs text-gray-400">Points</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-6 h-10">
                                    {reward.description}
                                </p>

                                <button
                                    onClick={() => handleRedeem(reward)}
                                    disabled={processing === reward.id || balance < reward.cost}
                                    className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center transition-all
                    ${balance >= reward.cost
                                            ? 'bg-gray-900 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/30'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {processing === reward.id ? (
                                        <span className="animate-pulse">Processing...</span>
                                    ) : balance >= reward.cost ? (
                                        <>
                                            Redeem Reward <ArrowRight className="ml-2 w-4 h-4" />
                                        </>
                                    ) : (
                                        <>Insufficient Points</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* History Section */}
                {redemptions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                    >
                        <div className="flex items-center mb-6">
                            <History className="w-6 h-6 text-green-600 mr-3" />
                            <h2 className="text-2xl font-bold text-gray-900">Redemption History</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-4 px-4 text-gray-500 font-medium">Reward</th>
                                        <th className="text-left py-4 px-4 text-gray-500 font-medium">Date</th>
                                        <th className="text-left py-4 px-4 text-gray-500 font-medium">Cost</th>
                                        <th className="text-left py-4 px-4 text-gray-500 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {redemptions.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 font-medium text-gray-900">{item.rewardName}</td>
                                            <td className="py-4 px-4 text-gray-600">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4 text-red-500 font-medium">-{item.amount}</td>
                                            <td className="py-4 px-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Completed
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
