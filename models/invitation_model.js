const mongoose = require('mongoose');

const invitation_schema = new mongoose.Schema({
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    inviter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invitee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null if user not yet registered
    },
    invitee_email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'expired'],
        default: 'pending'
    },
    expires_at: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
invitation_schema.index({ invitee_id: 1, status: 1 });
invitation_schema.index({ invitee_email: 1, status: 1 });
invitation_schema.index({ group_id: 1 });
invitation_schema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup

module.exports = mongoose.model('Invitation', invitation_schema);
