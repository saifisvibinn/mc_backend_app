const initializeSockets = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

        // Join a group room
        socket.on('join_group', (groupId) => {
            if (groupId) {
                socket.join(`group_${groupId}`);
                console.log(`[Socket] User ${socket.id} joined group_${groupId}`);
            }
        });

        // Leave a group room
        socket.on('leave_group', (groupId) => {
            if (groupId) {
                socket.leave(`group_${groupId}`);
                console.log(`[Socket] User ${socket.id} left group_${groupId}`);
            }
        });

        // Handle Location Updates
        socket.on('update_location', (data) => {
            // data Expects: { groupId, pilgrimId, lat, lng, ... }
            const { groupId } = data;
            if (groupId) {
                // Broadcast to others in the group (e.g. moderators)
                socket.to(`group_${groupId}`).emit('location_update', data);
                // console.log(`[Socket] Location update from ${data.pilgrimId}`);
            }
        });

        // Handle SOS Alerts
        socket.on('sos_alert', (data) => {
            // data Expects: { groupId, pilgrimId, message, location, ... }
            const { groupId } = data;
            if (groupId) {
                // Broadcast to everyone in group (so moderators see it immediately)
                io.to(`group_${groupId}`).emit('sos_alert', data);
                console.log(`[Socket] SOS Alert from ${data.pilgrimId} in group_${groupId}`);
            }
        });

        // --- WebRTC Signaling for Calls ---
        // Map of userId <-> socketId (for direct signaling)
        socket.on('register-user', ({ userId }) => {
            socket.data.userId = userId;
            console.log(`[Socket] User registered for calls: ${userId} -> ${socket.id}`);
        });

        // Helper to find socket by userId
        function getSocketByUserId(userId) {
            return Array.from(io.sockets.sockets.values()).find(s => s.data.userId === userId);
        }

        socket.on('call-offer', async ({ to, offer }) => {
            console.log(`[Socket] Call offer from ${socket.data.userId} to ${to}`);
            const target = getSocketByUserId(to);
            console.log(`[Socket] Target socket found: ${target ? 'YES (socket id: ' + target.id + ')' : 'NO (will send push notification)'}`);

            // Fetch caller information from database
            try {
                const User = require('../models/user_model');
                const Pilgrim = require('../models/pilgrim_model');
                const { sendPushNotification } = require('../services/pushNotificationService');

                console.log(`[Socket] Fetching caller info for userId: ${socket.data.userId}`);

                // Try to find in User model first (moderators)
                let caller = await User.findById(socket.data.userId).select('full_name role');

                // If not found, try Pilgrim model
                if (!caller) {
                    caller = await Pilgrim.findById(socket.data.userId).select('full_name role');
                }

                console.log(`[Socket] Caller found:`, caller);

                const callerInfo = {
                    id: socket.data.userId,
                    name: caller?.full_name || 'Unknown',
                    role: caller?.role || 'Unknown'
                };

                // Always fetch recipient for potential push notification
                let recipient = await User.findById(to).select('fcm_token full_name');
                if (!recipient) {
                    recipient = await Pilgrim.findById(to).select('fcm_token full_name');
                }

                if (target) {
                    // Recipient is online - send via socket
                    console.log(`[Socket] Sending call-offer via socket to ${to}`);
                    target.emit('call-offer', { offer, from: socket.data.userId, callerInfo });

                    // ALSO send push notification for reliability (app might be backgrounded)
                    if (recipient?.fcm_token) {
                        console.log(`[Socket] Also sending push notification (app might be backgrounded)...`);
                        await sendPushNotification(
                            [recipient.fcm_token],
                            'Incoming Call',
                            `${callerInfo.name} is calling you`,
                            {
                                type: 'incoming_call',
                                callerId: socket.data.userId,
                                callerName: callerInfo.name,
                                callerRole: callerInfo.role,
                                offer: JSON.stringify(offer)
                            },
                            true // isUrgent - use high priority
                        );
                        console.log(`[Socket] ✓ Push notification sent as backup`);
                    }
                } else {
                    console.log(`[Socket] Recipient ${to} is offline, sending push notification`);

                    console.log(`[Socket] Recipient found: ${recipient?.full_name}, FCM token: ${recipient?.fcm_token ? 'EXISTS' : 'MISSING'}`);

                    if (recipient?.fcm_token) {
                        console.log(`[Socket] Sending push notification to ${recipient.full_name}...`);
                        await sendPushNotification(
                            [recipient.fcm_token],
                            'Incoming Call',
                            `${callerInfo.name} is calling you`,
                            {
                                type: 'incoming_call',
                                callerId: socket.data.userId,
                                callerName: callerInfo.name,
                                callerRole: callerInfo.role,
                                offer: JSON.stringify(offer)
                            },
                            true // isUrgent - use high priority
                        );
                        console.log(`[Socket] ✓ Push notification sent successfully to ${recipient.full_name}`);
                    } else {
                        console.log(`[Socket] ✗ No FCM token found for recipient ${to}`);
                    }
                }
            } catch (error) {
                console.error('[Socket] Error fetching caller info:', error);
                if (target) {
                    target.emit('call-offer', { offer, from: socket.data.userId });
                }
            }
        });
        socket.on('call-answer', ({ to, answer }) => {
            console.log(`[Socket] Call answer from ${socket.data.userId} to ${to}`);
            const target = getSocketByUserId(to);
            if (target) {
                target.emit('call-answer', { answer, from: socket.data.userId });
            } else {
                console.log(`[Socket] Target user ${to} not found for call answer`);
            }
        });
        socket.on('ice-candidate', ({ to, candidate }) => {
            const target = getSocketByUserId(to);
            if (target) {
                target.emit('ice-candidate', { candidate, from: socket.data.userId });
            }
        });

        socket.on('call-declined', ({ to }) => {
            console.log(`[Socket] Call declined from ${socket.data.userId} to ${to}`);
            const target = getSocketByUserId(to);
            if (target) {
                target.emit('call-declined', { from: socket.data.userId });
            }
        });

        socket.on('call-end', ({ to }) => {
            console.log(`[Socket] Call end from ${socket.data.userId} to ${to}`);
            const target = getSocketByUserId(to);
            if (target) {
                target.emit('call-end', { from: socket.data.userId });
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.id}`);
        });
    });
};

module.exports = { initializeSockets };
