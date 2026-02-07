const express = require('express');
const router = express.Router();
const communication_ctrl = require('../controllers/communication_controller');
const { protect } = require('../middleware/auth_middleware');

router.use(protect);

router.post('/start-session', communication_ctrl.start_session);
router.post('/join-session', communication_ctrl.join_session);
router.post('/end-session', communication_ctrl.end_session);
router.get('/sessions/:group_id', communication_ctrl.get_active_sessions);

module.exports = router;
