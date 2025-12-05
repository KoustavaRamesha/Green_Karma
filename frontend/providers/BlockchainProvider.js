'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import blockchainService from '../lib/blockchain';
import { CHAIN_ID } from '../lib/contracts';
import toast from 'react-hot-toast';

const BlockchainContext = createContext(null);

export function BlockchainProvider({ children }) {
    const { address, isConnected, isConnecting } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    const [tokenBalance, setTokenBalance] = useState(0);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isVerifier, setIsVerifier] = useState(false);
    const [userRecords, setUserRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [blockchainStats, setBlockchainStats] = useState({
        totalUsers: 0,
        totalVerifiers: 0,
        totalRecords: 0,
        totalTokensIssued: 0,
    });

    // Check if on correct network
    const isCorrectNetwork = chainId === CHAIN_ID;

    // Switch to correct network
    const switchToCorrectNetwork = useCallback(async () => {
        try {
            await switchChain({ chainId: CHAIN_ID });
            toast.success('Switched to Hardhat network');
        } catch (error) {
            console.error('Failed to switch network:', error);
            toast.error('Please switch to Hardhat network (Chain ID: 1337)');
        }
    }, [switchChain]);

    // Fetch user's blockchain data
    const fetchUserData = useCallback(async () => {
        if (!address) return;

        try {
            setLoading(true);

            // Fetch token balance
            const balance = await blockchainService.getTokenBalance(address);
            setTokenBalance(balance);

            // Check if user is registered
            const registered = await blockchainService.isUserRegistered(address);
            setIsRegistered(registered);

            // Check if user is a verifier
            const verifier = await blockchainService.isVerifierRegistered(address);
            setIsVerifier(verifier);

            // Fetch user's recycling records
            if (registered) {
                const records = await blockchainService.getUserRecords(address);
                setUserRecords(records);
            }
        } catch (error) {
            console.error('Error fetching blockchain data:', error);
        } finally {
            setLoading(false);
        }
    }, [address]);

    // Fetch global blockchain stats (works without wallet connection)
    const fetchBlockchainStats = useCallback(async () => {
        try {
            console.log('📊 Fetching blockchain stats...');
            const [totalUsers, totalVerifiers, totalRecords, tokenDetails] = await Promise.all([
                blockchainService.getTotalUsers(),
                blockchainService.getTotalVerifiers(),
                blockchainService.getTotalRecords(),
                blockchainService.getTokenDetails(),
            ]);

            console.log('📊 Stats fetched:', { totalUsers, totalVerifiers, totalRecords, totalSupply: tokenDetails.totalSupply });

            setBlockchainStats({
                totalUsers,
                totalVerifiers,
                totalRecords,
                totalTokensIssued: tokenDetails.totalSupply,
            });
        } catch (error) {
            console.error('❌ Error fetching blockchain stats:', error);
        }
    }, []);

    // Fetch blockchain stats on mount (works without wallet)
    useEffect(() => {
        fetchBlockchainStats();
    }, [fetchBlockchainStats]);

    // Register user on blockchain
    const registerOnChain = async (identityHash) => {
        if (!address) {
            toast.error('Please connect your wallet first');
            return null;
        }

        try {
            setLoading(true);
            const result = await blockchainService.registerUserOnChain(identityHash, address);
            toast.success(`Registered on blockchain! TX: ${blockchainService.formatTxHash(result.txHash)}`);
            await fetchUserData();
            return result;
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Failed to register on blockchain');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Record recycling on blockchain
    const recordRecycling = async (userWallet, verifierWallet, category, weightKg, ipfsHash) => {
        try {
            setLoading(true);
            const weightGrams = Math.round(weightKg * 1000);
            const result = await blockchainService.recordRecyclingOnChain(
                userWallet,
                verifierWallet,
                category,
                weightGrams,
                ipfsHash
            );
            toast.success(`Recorded on blockchain! Record #${result.recordId}`);
            return result;
        } catch (error) {
            console.error('Recording error:', error);
            toast.error('Failed to record on blockchain');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Verify recycling on blockchain
    const verifyRecycling = async (recordId) => {
        try {
            setLoading(true);
            const result = await blockchainService.verifyRecyclingOnChain(recordId);
            toast.success(`Verified on blockchain! TX: ${blockchainService.formatTxHash(result.txHash)}`);
            return result;
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Failed to verify on blockchain');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Process reward on blockchain
    const processReward = async (recordId) => {
        try {
            setLoading(true);
            const result = await blockchainService.processReward(recordId);
            toast.success(`Reward processed! ${result.rewardAmount.toFixed(2)} CARB tokens minted`);
            await fetchUserData();
            return result;
        } catch (error) {
            console.error('Reward processing error:', error);
            toast.error('Failed to process reward');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Transfer tokens
    const transferTokens = async (to, amount) => {
        try {
            setLoading(true);
            const result = await blockchainService.transferTokens(to, amount);
            toast.success(`Transferred ${amount} CARB tokens!`);
            await fetchUserData();
            return result;
        } catch (error) {
            console.error('Transfer error:', error);
            toast.error('Failed to transfer tokens');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Burn tokens for redemption
    const burnTokensForRedemption = async (amount) => {
        try {
            setLoading(true);
            const result = await blockchainService.burnTokens(amount);
            toast.success(`Burned ${amount} CARB tokens for redemption!`);
            await fetchUserData();
            return result;
        } catch (error) {
            console.error('Burn error:', error);
            toast.error('Failed to burn tokens');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Calculate expected reward
    const calculateExpectedReward = async (category, weightKg) => {
        try {
            const weightGrams = Math.round(weightKg * 1000);
            return await blockchainService.calculateReward(category, weightGrams);
        } catch (error) {
            console.error('Calculation error:', error);
            return 0;
        }
    };

    // Fetch data when wallet connects
    useEffect(() => {
        if (isConnected && address) {
            fetchUserData();
            fetchBlockchainStats();
        }
    }, [isConnected, address, fetchUserData, fetchBlockchainStats]);

    // Set up event listeners
    useEffect(() => {
        if (!isConnected) return;

        // Listen for token transfers to/from this address
        const unsubscribe = blockchainService.onEvent('carbonToken', 'Transfer', (from, to, value) => {
            if (from === address || to === address) {
                fetchUserData();
            }
        });

        return () => unsubscribe?.();
    }, [isConnected, address, fetchUserData]);

    const value = {
        // Wallet state
        address,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        connectors,

        // Network state
        chainId,
        isCorrectNetwork,
        switchToCorrectNetwork,

        // User blockchain data
        tokenBalance,
        isRegistered,
        isVerifier,
        userRecords,

        // Global stats
        blockchainStats,

        // Loading state
        loading,

        // Actions
        registerOnChain,
        recordRecycling,
        verifyRecycling,
        processReward,
        transferTokens,
        burnTokensForRedemption,
        calculateExpectedReward,

        // Refresh functions
        refreshUserData: fetchUserData,
        refreshStats: fetchBlockchainStats,

        // Utility
        formatTxHash: blockchainService.formatTxHash,
        getExplorerUrl: blockchainService.getExplorerUrl,
    };

    return (
        <BlockchainContext.Provider value={value}>
            {children}
        </BlockchainContext.Provider>
    );
}

export function useBlockchain() {
    const context = useContext(BlockchainContext);
    if (!context) {
        throw new Error('useBlockchain must be used within a BlockchainProvider');
    }
    return context;
}

export default BlockchainContext;
