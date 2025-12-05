const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { db, adminDb } = require("../config/firebase");
const {
  issueCertificateOnChain,
  verifyCertificateOnChain,
  getCertificateFromChain,
  getUserCertificatesFromChain,
} = require("../utils/blockchain");
const crypto = require("crypto");

const router = express.Router();

// Minimum weight for certificate (40kg in grams)
const MINIMUM_CERTIFICATE_WEIGHT = 40000;

/**
 * Generate a unique certificate number
 */
function generateCertificateNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `GK-${timestamp}-${random}`;
}

/**
 * Create certificate hash for verification
 */
function createCertificateHash(data) {
  const hashString = JSON.stringify({
    recipientWallet: data.recipientWallet,
    recipientName: data.recipientName,
    verifierWallet: data.verifierWallet,
    verifierName: data.verifierName,
    weight: data.weight,
    category: data.category,
    submissionId: data.submissionId,
    issuedAt: data.issuedAt,
  });
  return crypto.createHash("sha256").update(hashString).digest("hex");
}

// Get user's certificates
router.get("/my-certificates", authMiddleware, async (req, res) => {
  try {
    // Get certificates from Firestore
    const certificatesSnapshot = await adminDb
      .collection("certificates")
      .where("recipientId", "==", req.userId)
      .get();

    const certificates = [];

    for (const doc of certificatesSnapshot.docs) {
      const data = doc.data();
      certificates.push({
        id: doc.id,
        ...data,
      });
    }

    // Sort by issue date (newest first)
    certificates.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));

    res.json({
      certificates,
      totalCertificates: certificates.length,
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

// Get single certificate details
router.get("/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certDoc = await adminDb
      .collection("certificates")
      .doc(certificateId)
      .get();

    if (!certDoc.exists) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    const certificate = { id: certDoc.id, ...certDoc.data() };

    res.json({ certificate });
  } catch (error) {
    console.error("Get certificate error:", error);
    res.status(500).json({ error: "Failed to fetch certificate" });
  }
});

// Verify certificate by hash or ID
router.get("/verify/:hashOrId", async (req, res) => {
  try {
    const { hashOrId } = req.params;

    let certificate = null;

    // Try to find by certificate hash first
    const hashSnapshot = await adminDb
      .collection("certificates")
      .where("certificateHash", "==", hashOrId)
      .limit(1)
      .get();

    if (!hashSnapshot.empty) {
      const doc = hashSnapshot.docs[0];
      certificate = { id: doc.id, ...doc.data() };
    } else {
      // Try to find by document ID
      const certDoc = await adminDb
        .collection("certificates")
        .doc(hashOrId)
        .get();
      if (certDoc.exists) {
        certificate = { id: certDoc.id, ...certDoc.data() };
      }
    }

    if (!certificate) {
      return res.json({
        valid: false,
        message: "Certificate not found",
      });
    }

    // Verify the hash
    const regeneratedHash = createCertificateHash({
      recipientWallet: certificate.recipientWallet,
      recipientName: certificate.recipientName,
      verifierWallet: certificate.verifierWallet,
      verifierName: certificate.verifierName,
      weight: certificate.weight,
      category: certificate.category,
      submissionId: certificate.submissionId,
      issuedAt: certificate.issuedAt,
    });

    const isValid =
      certificate.isValid && regeneratedHash === certificate.certificateHash;

    // Try blockchain verification if available
    let blockchainVerified = false;
    if (certificate.blockchainCertHash) {
      try {
        const blockchainResult = await verifyCertificateOnChain(
          certificate.blockchainCertHash
        );
        blockchainVerified = blockchainResult.isValid;
      } catch (e) {
        console.log("Blockchain verification unavailable:", e.message);
      }
    }

    res.json({
      valid: isValid,
      blockchainVerified,
      certificate: isValid
        ? {
            certificateNumber: certificate.certificateNumber,
            recipientName: certificate.recipientName,
            verifierName: certificate.verifierName,
            verifierOrganization: certificate.verifierOrganization,
            weight: certificate.weight,
            category: certificate.category,
            tokensAwarded: certificate.tokensAwarded,
            issuedAt: certificate.issuedAt,
            blockchainTxHash: certificate.blockchainTxHash,
          }
        : null,
      message: isValid
        ? "Certificate is valid and authentic"
        : "Certificate verification failed",
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    res.status(500).json({ error: "Failed to verify certificate" });
  }
});

// Issue certificate (internal use - called from verifier route)
async function issueCertificate(submissionData, userData, verifierData) {
  const weightInGrams = Math.floor(submissionData.actualWeight * 1000);

  // Check if weight qualifies for certificate
  if (weightInGrams < MINIMUM_CERTIFICATE_WEIGHT) {
    return null;
  }

  const certificateNumber = generateCertificateNumber();
  const issuedAt = new Date().toISOString();

  const certData = {
    certificateNumber,
    recipientId: submissionData.userId,
    recipientWallet: userData.walletAddress,
    recipientName: userData.name,
    verifierId: verifierData.id,
    verifierWallet: verifierData.walletAddress,
    verifierName: verifierData.name,
    verifierOrganization: verifierData.organization || "Green Karma Verifier",
    submissionId: submissionData.id,
    weight: submissionData.actualWeight,
    weightGrams: weightInGrams,
    category: submissionData.category,
    tokensAwarded: submissionData.rewardAmount,
    issuedAt,
    isValid: true,
  };

  // Create certificate hash
  certData.certificateHash = createCertificateHash({
    recipientWallet: certData.recipientWallet,
    recipientName: certData.recipientName,
    verifierWallet: certData.verifierWallet,
    verifierName: certData.verifierName,
    weight: certData.weight,
    category: certData.category,
    submissionId: certData.submissionId,
    issuedAt: certData.issuedAt,
  });

  // Try to issue on blockchain
  try {
    const blockchainResult = await issueCertificateOnChain(
      certData.recipientWallet,
      certData.verifierWallet,
      certData.recipientName,
      certData.verifierName,
      certData.verifierOrganization,
      weightInGrams,
      certData.category,
      parseInt(certData.submissionId) || 0,
      Math.floor(certData.tokensAwarded)
    );

    certData.blockchainCertId = blockchainResult.certificateId;
    certData.blockchainCertHash = blockchainResult.certificateHash;
    certData.blockchainTxHash = blockchainResult.transactionHash;
    certData.blockchainVerified = true;
  } catch (blockchainError) {
    console.log(
      "Blockchain certificate unavailable (using Firestore only):",
      blockchainError.message
    );
    certData.blockchainVerified = false;
  }

  // Store in Firestore
  const certRef = await db.collection("certificates").add(certData);

  return {
    id: certRef.id,
    ...certData,
  };
}

module.exports = {
  router,
  issueCertificate,
  MINIMUM_CERTIFICATE_WEIGHT,
};
