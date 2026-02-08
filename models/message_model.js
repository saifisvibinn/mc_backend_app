const mongoose = require('mongoose');

const message_schema = new mongoose.Schema({
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'sender_model'
    },
    sender_model: {
        type: String,
        required: true,
        enum: ['User', 'Pilgrim']
    },
    type: {
        type: String,
        enum: ['text', 'voice', 'image', 'tts'],
        default: 'text'
    },
    content: {
        type: String,
        required: function () { return this.type === 'text' || this.type === 'tts'; }
    },
    media_url: {
        type: String,
        required: function () { return this.type === 'voice' || this.type === 'image'; }
    },
    is_urgent: {
        type: Boolean,
        default: false
    },
    original_text: {
        type: String,
        required: function () { return this.type === 'tts'; }
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', message_schema);
