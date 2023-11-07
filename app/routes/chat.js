const express = require('express');

const { authorization } = require('../middlewares/authorization');
const {
  createChat,
  addMessage,
  addFileMessage,
} = require('../controllers/chat');

const router = express.Router();

router.post('/create', authorization, createChat);
router.post('/message', authorization, addMessage);
router.post('/fileMessage', authorization, addFileMessage);
module.exports = router;
