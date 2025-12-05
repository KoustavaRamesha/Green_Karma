const express = require("express");
const multer = require("multer");
const QRCode = require("qrcode");
const { authMiddleware } = require("../middleware/auth");
const { db } = require("../config/firebase");
const { uploadToIPFS } = require("../utils/ipfs");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Submit waste for recycling
router.post(
  "/submit",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { category, weight } = req.body;

      if (!category || !weight) {
        return res
          .status(400)
          .json({ error: "Category and weight are required" });
      }

      if (
        !["Plastic", "Paper", "Metal", "EWaste", "Organic"].includes(category)
      ) {
        return res.status(400).json({ error: "Invalid waste category" });
      }

      let ipfsHash = "";
      let imageUrl = "";

      // Upload image to IPFS if provided
      if (req.file) {
        try {
          const ipfsResult = await uploadToIPFS(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
          );
          ipfsHash = ipfsResult.hash;
          imageUrl = ipfsResult.url;
        } catch (ipfsError) {
          console.error("IPFS upload error:", ipfsError);
        }
      }

      // Create waste submission in Firestore
      const submissionData = {
        userId: req.userId,
        userWallet: req.user.walletAddress,
        category,
        weight: parseFloat(weight),
        ipfsHash,
        imageUrl,
        status: "pending",
        verifierId: null,
        verifierWallet: "",
        actualWeight: 0,
        blockchainRecordId: 0,
        rewardAmount: 0,
        rewardClaimed: false,
        verifiedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const submissionRef = await db
        .collection("wasteSubmissions")
        .add(submissionData);

      // Generate QR code
      const qrData = JSON.stringify({
        submissionId: submissionRef.id,
        userId: req.userId,
        category,
        weight,
        timestamp: Date.now(),
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData);

      // Update submission with QR code
      await submissionRef.update({ qrCode: qrCodeDataUrl });

      res.status(201).json({
        message: "Waste submission created successfully",
        submission: {
          id: submissionRef.id,
          category: submissionData.category,
          weight: submissionData.weight,
          qrCode: qrCodeDataUrl,
          status: submissionData.status,
          ipfsHash: submissionData.ipfsHash,
          imageUrl: submissionData.imageUrl,
        },
      });
    } catch (error) {
      console.error("Waste submission error:", error);
      res.status(500).json({ error: "Failed to submit waste" });
    }
  }
);

// Get user's waste submissions
router.get("/submissions", authMiddleware, async (req, res) => {
  try {
    const submissionsSnapshot = await db
      .collection("wasteSubmissions")
      .where("userId", "==", req.userId)
      .orderBy("createdAt", "desc")
      .get();

    const submissions = [];

    for (const doc of submissionsSnapshot.docs) {
      const data = doc.data();
      let verifier = null;

      if (data.verifierId) {
        const verifierDoc = await db
          .collection("users")
          .doc(data.verifierId)
          .get();
        if (verifierDoc.exists) {
          verifier = {
            name: verifierDoc.data().name,
            organization: verifierDoc.data().organization,
          };
        }
      }

      submissions.push({
        id: doc.id,
        category: data.category,
        weight: data.weight,
        status: data.status,
        qrCode: data.qrCode,
        imageUrl: data.imageUrl,
        rewardAmount: data.rewardAmount,
        rewardClaimed: data.rewardClaimed,
        verifier,
        createdAt: data.createdAt,
        verifiedAt: data.verifiedAt,
      });
    }

    res.json({ submissions });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Get submission by ID
router.get("/submission/:id", authMiddleware, async (req, res) => {
  try {
    const submissionDoc = await db
      .collection("wasteSubmissions")
      .doc(req.params.id)
      .get();

    if (!submissionDoc.exists) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const submission = { id: submissionDoc.id, ...submissionDoc.data() };

    // Check if user owns this submission or is a verifier
    if (
      submission.userId !== req.userId &&
      req.user.role !== "verifier" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get user info
    const userDoc = await db.collection("users").doc(submission.userId).get();
    submission.user = userDoc.exists
      ? {
          name: userDoc.data().name,
          email: userDoc.data().email,
          walletAddress: userDoc.data().walletAddress,
        }
      : null;

    // Get verifier info
    if (submission.verifierId) {
      const verifierDoc = await db
        .collection("users")
        .doc(submission.verifierId)
        .get();
      submission.verifier = verifierDoc.exists
        ? {
            name: verifierDoc.data().name,
            organization: verifierDoc.data().organization,
          }
        : null;
    }

    res.json({ submission });
  } catch (error) {
    console.error("Get submission error:", error);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
});

module.exports = router;
