import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Shield, CheckCircle, XCircle, ExternalLink, Leaf } from 'lucide-react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';

export default function VerifyCertificate() {
    const router = useRouter();
    const { tokenId, tx } = router.query;
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [verified, setVerified] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);

    useEffect(() => {
        if (tokenId) {
            verifyCertificate();
        }
    }, [tokenId]);

    const verifyCertificate = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use the blockchain verification endpoint for true tamper-proof verification
            const response = await api.get(`/api/verify/certificate/${tokenId}`);
            
            if (response.data.verified) {
                setVerified(response.data.tamperProof);
                setCertificate(response.data.certificate);
                setVerificationStatus(response.data.verificationStatus);
            } else {
                setError(response.data.error || 'Certificate not found');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError('Failed to verify certificate. It may not exist or may not be available yet.');
        } finally {
            setLoading(false);
        }
    };

    const explorerUrl = process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER || 'https://sepolia.etherscan.io';

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <Navbar />
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Verifying certificate...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <Navbar />
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
                            <p className="text-gray-600 mb-6">{error || 'This certificate could not be verified.'}</p>
                            <button
                                onClick={() => router.push('/')}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                Return Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
            <Navbar />
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto">
                    {/* Verification Status */}
                    <div className={`bg-white rounded-2xl shadow-xl p-8 mb-6 ${verified ? 'border-2 border-green-500' : 'border-2 border-yellow-500'}`}>
                        <div className="flex items-center justify-center gap-4 mb-4">
                            {verified ? (
                                <>
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                    <div>
                                        <h1 className="text-3xl font-bold text-green-700">Certificate Verified</h1>
                                        <p className="text-sm text-green-600 font-semibold mt-1">✓ Tamper-Proof (Blockchain Verified)</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-12 h-12 text-yellow-500" />
                                    <div>
                                        <h1 className="text-3xl font-bold text-yellow-700">Certificate Found</h1>
                                        <p className="text-sm text-yellow-600 font-semibold mt-1">⚠ Not Yet Verified on Blockchain</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-gray-700 mb-4">
                                {verified 
                                    ? 'This certificate has been verified directly on the blockchain and is tamper-proof. All data is permanently stored on-chain and cannot be altered.'
                                    : verificationStatus?.recommendation || 'This certificate exists, but blockchain verification is pending or unavailable. It may be a temporary certificate.'}
                            </p>
                            {verificationStatus && (
                                <div className={`p-3 rounded-lg ${verified ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                    <p className={`text-sm font-medium ${verified ? 'text-green-800' : 'text-yellow-800'}`}>
                                        {verificationStatus.recommendation}
                                    </p>
                                    <div className="mt-2 flex items-center justify-center gap-4 text-xs">
                                        {verificationStatus.blockchainVerified && (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="w-3 h-3" /> On-Chain Verified
                                            </span>
                                        )}
                                        {verificationStatus.hasTransactionHash && (
                                            <span className="flex items-center gap-1 text-blue-600">
                                                <CheckCircle className="w-3 h-3" /> Has TX Hash
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Leaf className="w-8 h-8 text-green-700" />
                            <h2 className="text-2xl font-bold text-gray-900">Certificate Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <label className="text-sm font-semibold text-gray-500 uppercase">Recipient</label>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {certificate.recipientName || certificate.recipient || 'Anonymous'}
                                </p>
                            </div>

                            <div className="border-b pb-4">
                                <label className="text-sm font-semibold text-gray-500 uppercase">Certificate Type</label>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {certificate.certificateType} Tier Recycler
                                </p>
                            </div>

                            <div className="border-b pb-4">
                                <label className="text-sm font-semibold text-gray-500 uppercase">Waste Recycled</label>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {((certificate.totalWeight || certificate.weight * 1000) / 1000).toFixed(1)} kg of {certificate.category}
                                </p>
                            </div>

                            {certificate.verifierName && (
                                <div className="border-b pb-4">
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Verified By</label>
                                    <p className="text-lg font-medium text-gray-900 mt-1">
                                        {certificate.verifierName}
                                    </p>
                                    {certificate.verifierWallet && (
                                        <p className="text-sm text-gray-500 font-mono mt-1">
                                            {certificate.verifierWallet}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="border-b pb-4">
                                <label className="text-sm font-semibold text-gray-500 uppercase">Issued Date</label>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {certificate.issuedAt 
                                        ? new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'Pending'}
                                </p>
                            </div>

                            <div className="border-b pb-4">
                                <label className="text-sm font-semibold text-gray-500 uppercase">Certificate Token ID</label>
                                <p className="text-lg font-medium text-gray-900 font-mono mt-1">
                                    #{certificate.tokenId}
                                </p>
                            </div>

                            {certificate.txHash && (
                                <div className="border-b pb-4">
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Blockchain Transaction</label>
                                    <div className="mt-1">
                                        <a
                                            href={`${explorerUrl}/tx/${certificate.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg font-medium text-green-600 hover:text-green-700 font-mono flex items-center gap-2"
                                        >
                                            {certificate.txHash.slice(0, 10)}...{certificate.txHash.slice(-8)}
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {certificate.blockNumber && (
                                <div className="pb-4">
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Block Number</label>
                                    <p className="text-lg font-medium text-gray-900 font-mono mt-1">
                                        #{certificate.blockNumber}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-green-900 mb-1">Blockchain Verification</p>
                                    <p className="text-xs text-green-700">
                                        This certificate is permanently stored on the Ethereum blockchain. 
                                        All data is cryptographically secured and cannot be altered or forged.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

