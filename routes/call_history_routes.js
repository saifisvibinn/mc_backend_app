const express = require('express');
const router = express.Router();
const CallHistory = require('../models/call_history_model');
const { protect } = require('../middleware/auth_middleware');

// Get call history for current user
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find calls where user is either caller or receiver
        const calls = await CallHistory.find({
            $or: [
                { caller_id: userId },
                { receiver_id: userId }
            ]
        })
            .populate('caller_id', 'full_name role phone_number')
            .populate('receiver_id', 'full_name role phone_number')
            .sort({ createdAt: -1 })
            .limit(100); // Limit to last 100 calls

        res.json(calls);
    } catch (error) {
        console.error('Error fetching call history:', error);
        res.status(500).json({ error: 'Failed to fetch call history' });
    }
});

// Create call record (used internally by socket handlers)
router.post('/', protect, async (req, res) => {
    try {
        const { receiver_id, receiver_model, call_type } = req.body;
        const caller_id = req.user.id;
        const caller_model = req.user.role === 'pilgrim' ? 'Pilgrim' : 'User';

        const callRecord = new CallHistory({
            caller_id,
            caller_model,
            receiver_id,
            receiver_model,
            call_type: call_type || 'internet',
            status: 'ringing'
        });

        await callRecord.save();
        res.status(201).json(callRecord);
    } catch (error) {
        console.error('Error creating call record:', error);
        res.status(500).json({ error: 'Failed to create call record' });
    }
});

module.exports = router;
