const mongoose = require('mongoose');

const pending_user_schema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Already hashed
    phone_number: { type: String, required: true },
    verification_code: { type: String, required: true },
    created_at: { type: Date, default: Date.now } // Auto-delete handled by index
});

// TTL index for automatic expiration
pending_user_schema.index({ created_at: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('PendingUser', pending_user_schema);
