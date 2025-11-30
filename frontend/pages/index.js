import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Leaf, Recycle, Award, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

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

    const stats = [
        { value: '10K+', label: 'Users' },
        { value: '50K+', label: 'KG Recycled' },
        { value: '100K+', label: 'Tokens Earned' },
        { value: '500+', label: 'Verifiers' }
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
                            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Recycle Today,
                                <span className="text-gradient"> Earn Forever</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Join the blockchain-powered recycling revolution. Earn Carbon Tokens for every kilogram you recycle, verified by government officials.
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
                            <div className="relative w-full h-96 bg-gradient-green rounded-2xl shadow-2xl flex items-center justify-center">
                                <Leaf className="w-48 h-48 text-white/20 absolute animate-float" />
                                <div className="relative z-10 text-center text-white">
                                    <div className="text-6xl font-bold mb-2">🌱</div>
                                    <div className="text-3xl font-bold">Green Karma</div>
                                    <div className="text-lg opacity-90">Blockchain Recycling</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
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
                            Join thousands of users earning rewards while saving the planet
                        </p>
                        <Link href="/register" className="bg-white text-primary-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition inline-flex items-center">
                            Get Started Now
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Leaf className="w-6 h-6" />
                                <span className="text-xl font-bold">Green Karma</span>
                            </div>
                            <p className="text-gray-400">
                                Blockchain-powered recycling rewards platform for a sustainable future.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                                <li><Link href="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Legal</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 Green Karma. All rights reserved. Built with 💚 for a sustainable future.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
