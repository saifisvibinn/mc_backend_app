const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth_middleware');
const {
    get_notifications,
    mark_as_read,
    mark_all_read
} = require('../controllers/notification_controller');

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', get_notifications);

// Mark single notification as read
router.put('/:id/read', mark_as_read);

// Mark all notifications as read
router.put('/read-all', mark_all_read);

module.exports = router;
