const mongoose = require('mongoose');

const wasteSubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userWallet: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Plastic', 'Paper', 'Metal', 'EWaste', 'Organic'],
        required: true
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    ipfsHash: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    },
    qrCode: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verifierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    verifierWallet: {
        type: String,
        default: ''
    },
    actualWeight: {
        type: Number,
        default: 0
    },
    blockchainRecordId: {
        type: Number,
        default: 0
    },
    rewardAmount: {
        type: Number,
        default: 0
    },
    rewardClaimed: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

wasteSubmissionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('WasteSubmission', wasteSubmissionSchema);
