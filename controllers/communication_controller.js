const CommunicationSession = require('../models/communication_session_model');
const Group = require('../models/group_model');

// Start a new communication session
exports.start_session = async (req, res) => {
    try {
        const { group_id, type } = req.body;

        if (!['voice_call', 'video_call', 'walkie_talkie'].includes(type)) {
            return res.status(400).json({ message: "Invalid session type" });
        }

        // Verify group membership
        // ... (assume protected middleware checks role, but we should check group membership)

        const initiator_model = req.user.role === 'pilgrim' ? 'Pilgrim' : 'User';

        const session = await CommunicationSession.create({
            group_id,
            initiator_id: req.user.id,
            initiator_model,
            type,
            participants: [{
                user_id: req.user.id,
                user_model: initiator_model
            }]
        });

        res.status(201).json({
            success: true,
            message: "Session started",
            session_id: session._id,
            data: session
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Join an active session
exports.join_session = async (req, res) => {
    try {
        const { session_id } = req.body;

        const session = await CommunicationSession.findById(session_id);
        if (!session || session.status !== 'active') {
            return res.status(404).json({ message: "Active session not found" });
        }

        const user_model = req.user.role === 'pilgrim' ? 'Pilgrim' : 'User';

        // Check if already joined
        const isJoined = session.participants.some(p => p.user_id.toString() === req.user.id);
        if (isJoined) {
            return res.status(200).json({ message: "Already in session", session });
        }

        session.participants.push({
            user_id: req.user.id,
            user_model
        });

        await session.save();

        res.json({
            success: true,
            message: "Joined session",
            session
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// End a session (Initiator or Admin/Moderator only)
exports.end_session = async (req, res) => {
    try {
        const { session_id } = req.body;

        const session = await CommunicationSession.findById(session_id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Only initiator or moderator can end (simplified check)
        if (session.initiator_id.toString() !== req.user.id && req.user.role === 'pilgrim') {
            return res.status(403).json({ message: "Not authorized to end this session" });
        }

        session.status = 'ended';
        session.ended_at = Date.now();
        await session.save();

        res.json({ message: "Session ended" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get active sessions for a group
exports.get_active_sessions = async (req, res) => {
    try {
        const { group_id } = req.params;

        const sessions = await CommunicationSession.find({
            group_id,
            status: 'active'
        }).populate('initiator_id', 'full_name');

        res.json({
            success: true,
            data: sessions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
