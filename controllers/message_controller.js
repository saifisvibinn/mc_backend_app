const Message = require('../models/message_model');
const Group = require('../models/group_model');

// Send a message (Text, Voice, Image, or TTS)
exports.send_message = async (req, res) => {
    try {
        const { group_id, type, content, is_urgent, original_text } = req.body;
        const file = req.file;

        // Validation
        if (!group_id) {
            return res.status(400).json({ message: "Group ID is required" });
        }

        // Verify sender belongs to the group (as moderator or admin)
        // Note: Currently assuming only moderators/admins send broadcast messages
        // If pilgrims can reply, we'd check if they are in the group.

        let media_url = null;
        if (type === 'voice' || type === 'image') {
            if (!file) {
                return res.status(400).json({ message: "Media file is required for voice/image messages" });
            }
            media_url = file.filename; // or full path depending on storage config
        }

        const sender_model = req.user.role === 'pilgrim' ? 'Pilgrim' : 'User';

        const message = await Message.create({
            group_id,
            sender_id: req.user.id,
            sender_model,
            type: type || 'text',
            content,
            media_url,
            is_urgent: is_urgent || false,
            original_text: type === 'tts' ? original_text : undefined
        });

        // Populate sender info for immediate frontend display
        await message.populate('sender_id', 'full_name profile_picture role');

        res.status(201).json({
            success: true,
            data: message
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get messages for a group
exports.get_group_messages = async (req, res) => {
    try {
        const { group_id } = req.params;
        const { limit = 50, before } = req.query; // Pagination using timestamp

        const query = { group_id };
        if (before) {
            query.created_at = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ created_at: -1 }) // Newest first
            .limit(parseInt(limit))
            .populate('sender_id', 'full_name profile_picture role');

        res.json({
            success: true,
            data: messages
        });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a message (moderators only)
exports.delete_message = async (req, res) => {
    try {
        const { message_id } = req.params;

        const message = await Message.findById(message_id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Verify the user is the sender or a moderator of the group
        const group = await Group.findById(message.group_id);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isModerator = group.moderator_ids.some(id => id.toString() === req.user.id) ||
            group.created_by.toString() === req.user.id;
        const isSender = message.sender_id.toString() === req.user.id;

        if (!isModerator && !isSender) {
            return res.status(403).json({ message: "Not authorized to delete this message" });
        }

        await Message.findByIdAndDelete(message_id);

        res.json({
            success: true,
            message: "Message deleted successfully"
        });

    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: "Server error" });
    }
};
