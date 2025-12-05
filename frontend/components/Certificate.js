import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Shield,
  CheckCircle,
  Download,
  ExternalLink,
  Copy,
  X,
  Leaf,
  Verified,
  Clock,
  FileCheck,
  Lock,
  LinkIcon,
} from "lucide-react";
import html2canvas from "html2canvas";

// Certificate verification status badge
const VerificationBadge = ({ verified, blockchain }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
      blockchain
        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
        : verified
        ? "bg-blue-100 text-blue-700 border border-blue-200"
        : "bg-gray-100 text-gray-600 border border-gray-200"
    }`}
  >
    {blockchain ? (
      <>
        <Lock className="w-3 h-3" />
        Blockchain Verified
      </>
    ) : verified ? (
      <>
        <Shield className="w-3 h-3" />
        Verified
      </>
    ) : (
      <>
        <Clock className="w-3 h-3" />
        Pending
      </>
    )}
  </div>
);

// Certificate card for list view
export const CertificateCard = ({ certificate, onClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className="bg-white rounded-2xl border-2 border-amber-100 shadow-lg shadow-amber-100/50 p-6 cursor-pointer hover:border-amber-300 hover:shadow-xl transition-all relative overflow-hidden group"
    >
      {/* Gold accent corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-200/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-amber-100/50 to-transparent" />

      <div className="relative flex items-start gap-4">
        {/* Certificate Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
          <Award className="w-8 h-8 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              Eco Champion Certificate
            </h3>
            <VerificationBadge
              verified={certificate.isValid}
              blockchain={certificate.blockchainVerified}
            />
          </div>

          <p className="text-sm text-gray-500 mb-3">
            Certificate #{certificate.certificateNumber}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Leaf className="w-4 h-4" />
              <span className="font-semibold">{certificate.weight} kg</span>
              <span className="text-gray-500">{certificate.category}</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatDate(certificate.issuedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium mr-1">View</span>
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
};

// Full certificate modal view
export const CertificateModal = ({ certificate, isOpen, onClose }) => {
  const certificateRef = useRef(null);
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!certificate) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `GreenKarma-Certificate-${certificate.certificateNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyHash = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(certificate.certificateHash);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      setCopying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-3xl shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Certificate Content */}
            <div className="p-8">
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mb-6">
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  {copying ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Hash
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download
                    </>
                  )}
                </button>
              </div>

              {/* Certificate Design */}
              <div
                ref={certificateRef}
                className="relative bg-gradient-to-br from-amber-50 via-white to-emerald-50 rounded-2xl border-4 border-amber-300 shadow-2xl overflow-hidden"
              >
                {/* Ornate border pattern */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-amber-200/50 rounded-xl" />
                  <div className="absolute inset-6 border border-amber-100/50 rounded-lg" />
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-32 h-32">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-amber-300/30"
                  >
                    <path
                      d="M0,0 L100,0 L100,20 Q50,20 20,50 L20,100 L0,100 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 rotate-90">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-amber-300/30"
                  >
                    <path
                      d="M0,0 L100,0 L100,20 Q50,20 20,50 L20,100 L0,100 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 w-32 h-32 -rotate-90">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-amber-300/30"
                  >
                    <path
                      d="M0,0 L100,0 L100,20 Q50,20 20,50 L20,100 L0,100 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 rotate-180">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-amber-300/30"
                  >
                    <path
                      d="M0,0 L100,0 L100,20 Q50,20 20,50 L20,100 L0,100 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                <div className="relative p-12 text-center">
                  {/* Header */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                      <Leaf className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="text-emerald-800 text-sm font-semibold tracking-[0.3em] uppercase mb-2">
                    Green Karma
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold text-amber-700 mb-2 font-serif">
                    Certificate of Achievement
                  </h1>

                  <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-300" />
                    <Award className="w-6 h-6 text-amber-500" />
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-300" />
                  </div>

                  {/* Main Content */}
                  <p className="text-gray-600 text-lg mb-4">
                    This is to certify that
                  </p>

                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
                    {certificate.recipientName}
                  </h2>

                  <p className="text-gray-600 text-lg mb-6 max-w-xl mx-auto">
                    has demonstrated exceptional commitment to environmental
                    sustainability by successfully recycling
                  </p>

                  {/* Achievement Stats */}
                  <div className="flex items-center justify-center gap-8 mb-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-emerald-600 mb-1">
                        {certificate.weight}
                        <span className="text-2xl ml-1">kg</span>
                      </div>
                      <div className="text-sm text-gray-500 uppercase tracking-wider">
                        of {certificate.category}
                      </div>
                    </div>
                    <div className="h-16 w-px bg-gray-200" />
                    <div className="text-center">
                      <div className="text-5xl font-bold text-amber-600 mb-1">
                        {certificate.tokensAwarded}
                      </div>
                      <div className="text-sm text-gray-500 uppercase tracking-wider">
                        Carbon Tokens Earned
                      </div>
                    </div>
                  </div>

                  {/* Verification Section */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-amber-200 p-6 mb-8 max-w-lg mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {certificate.blockchainVerified ? (
                        <Lock className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Shield className="w-5 h-5 text-blue-600" />
                      )}
                      <span className="font-semibold text-gray-800">
                        {certificate.blockchainVerified
                          ? "Blockchain Verified"
                          : "Digitally Verified"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono break-all bg-gray-100 rounded-lg p-2">
                      {certificate.certificateHash}
                    </div>
                    {certificate.blockchainTxHash && (
                      <a
                        href={`https://etherscan.io/tx/${certificate.blockchainTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 mt-2"
                      >
                        <LinkIcon className="w-3 h-3" />
                        View on Blockchain
                      </a>
                    )}
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto mb-8">
                    <div className="text-center">
                      <div className="h-px bg-gray-400 mb-2" />
                      <div className="font-semibold text-gray-800">
                        {certificate.verifierName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {certificate.verifierOrganization}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Verified By
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="h-px bg-gray-400 mb-2" />
                      <div className="font-semibold text-gray-800">
                        Green Karma
                      </div>
                      <div className="text-sm text-gray-500">
                        Blockchain Recycling Platform
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Issued By
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-amber-200">
                    <div>
                      Certificate No:{" "}
                      <span className="font-mono font-semibold">
                        {certificate.certificateNumber}
                      </span>
                    </div>
                    <div>Issued: {formatDate(certificate.issuedAt)}</div>
                  </div>
                </div>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <Leaf className="w-96 h-96 text-emerald-900" />
                </div>
              </div>

              {/* Certificate Details */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Certificate Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Submission ID:</span>
                    <span className="ml-2 font-mono text-gray-700">
                      {certificate.submissionId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Recipient Wallet:</span>
                    <span className="ml-2 font-mono text-gray-700 truncate">
                      {certificate.recipientWallet?.slice(0, 10)}...
                      {certificate.recipientWallet?.slice(-8)}
                    </span>
                  </div>
                  {certificate.blockchainCertId && (
                    <div>
                      <span className="text-gray-500">Blockchain ID:</span>
                      <span className="ml-2 font-mono text-gray-700">
                        #{certificate.blockchainCertId}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span
                      className={`ml-2 font-semibold ${
                        certificate.isValid
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {certificate.isValid ? "Valid" : "Revoked"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Empty state for no certificates
export const NoCertificates = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
      <Award className="w-12 h-12 text-amber-500" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">
      No Certificates Yet
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      Certificates are awarded for recycling submissions of{" "}
      <span className="font-semibold text-emerald-600">40kg or more</span>. Keep
      recycling to earn your first blockchain-verified certificate!
    </p>
    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
      <FileCheck className="w-4 h-4" />
      <span>Tamper-proof • Blockchain verified • Permanent record</span>
    </div>
  </motion.div>
);

export default CertificateModal;
