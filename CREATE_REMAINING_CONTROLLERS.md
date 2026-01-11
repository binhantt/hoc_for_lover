# Tạo Các Controllers và Routes Còn Lại

## 1. swipeController.js

Tạo file `src/controllers/swipeController.js`:

```javascript
const { Swipe, SwipeLimit, Match, Profile, User, ChatSession } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

exports.getPotentialMatches = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get user's swipe history
    const swipedUsers = await Swipe.findAll({
      where: { user_id: req.userId },
      attributes: ['target_user_id']
    });
    
    const swipedUserIds = swipedUsers.map(s => s.target_user_id);
    swipedUserIds.push(req.userId); // Exclude self
    
    // Get potential matches
    const profiles = await Profile.findAll({
      where: {
        user_id: { [Op.notIn]: swipedUserIds },
        profile_visible: true
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'display_name', 'photo_url']
      }],
      limit: parseInt(limit)
    });
    
    res.json({ profiles });
  } catch (error) {
    next(error);
  }
};

exports.recordSwipe = async (req, res, next) => {
  try {
    const { targetUserId, action } = req.body;
    
    if (!targetUserId || !action) {
      return res.status(400).json({ error: 'Target user ID and action required' });
    }
    
    if (!['like', 'skip'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    // Check swipe limit
    const today = new Date().toISOString().split('T')[0];
    let swipeLimit = await SwipeLimit.findOne({
      where: { user_id: req.userId }
    });
    
    if (!swipeLimit) {
      swipeLimit = await SwipeLimit.create({
        user_id: req.userId,
        swipe_count: 0,
        last_swipe_date: today
      });
    }
    
    // Check if new day
    if (swipeLimit.last_swipe_date !== today) {
      await swipeLimit.update({
        swipe_count: 0,
        last_swipe_date: today
      });
    }
    
    // Check limit (50 for non-VIP)
    if (!swipeLimit.is_vip && swipeLimit.swipe_count >= 50) {
      return res.status(429).json({
        error: 'Daily swipe limit reached',
        limit: 50,
        remaining: 0
      });
    }
    
    // Record swipe
    await Swipe.create({
      user_id: req.userId,
      target_user_id: targetUserId,
      action
    });
    
    // Update swipe count
    await swipeLimit.increment('swipe_count');
    
    // Check for match if action is 'like'
    let match = null;
    if (action === 'like') {
      const reciprocalSwipe = await Swipe.findOne({
        where: {
          user_id: targetUserId,
          target_user_id: req.userId,
          action: 'like'
        }
      });
      
      if (reciprocalSwipe) {
        // Create match
        const chatSessionId = uuidv4();
        
        match = await Match.create({
          user1_id: req.userId,
          user2_id: targetUserId,
          chat_session_id: chatSessionId
        });
        
        // Create chat session
        await ChatSession.create({
          id: chatSessionId,
          user1_id: req.userId,
          user2_id: targetUserId
        });
      }
    }
    
    res.json({
      message: 'Swipe recorded',
      match: match ? true : false,
      matchData: match
    });
  } catch (error) {
    next(error);
  }
};

exports.getRemainingSwipes = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let swipeLimit = await SwipeLimit.findOne({
      where: { user_id: req.userId }
    });
    
    if (!swipeLimit) {
      return res.json({
        remaining: 50,
        total: 50,
        isVip: false
      });
    }
    
    // Reset if new day
    if (swipeLimit.last_swipe_date !== today) {
      await swipeLimit.update({
        swipe_count: 0,
        last_swipe_date: today
      });
      swipeLimit.swipe_count = 0;
    }
    
    const remaining = swipeLimit.is_vip ? -1 : Math.max(0, 50 - swipeLimit.swipe_count);
    
    res.json({
      remaining: swipeLimit.is_vip ? 'unlimited' : remaining,
      used: swipeLimit.swipe_count,
      total: swipeLimit.is_vip ? 'unlimited' : 50,
      isVip: swipeLimit.is_vip
    });
  } catch (error) {
    next(error);
  }
};
```

## 2. swipe routes

Tạo file `src/routes/swipe.js`:

```javascript
const express = require('express');
const router = express.Router();
const swipeController = require('../controllers/swipeController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/potential', swipeController.getPotentialMatches);
router.post('/', swipeController.recordSwipe);
router.get('/remaining', swipeController.getRemainingSwipes);

module.exports = router;
```

## 3. matchController.js

Tạo file `src/controllers/matchController.js`:

```javascript
const { Match, User, Profile } = require('../models');
const { Op } = require('sequelize');

exports.getMatches = async (req, res, next) => {
  try {
    const matches = await Match.findAll({
      where: {
        [Op.or]: [
          { user1_id: req.userId },
          { user2_id: req.userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'display_name', 'photo_url'],
          include: [{ model: Profile, as: 'profile' }]
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'display_name', 'photo_url'],
          include: [{ model: Profile, as: 'profile' }]
        }
      ],
      order: [['matched_at', 'DESC']]
    });
    
    res.json({ matches });
  } catch (error) {
    next(error);
  }
};

exports.unmatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    
    const match = await Match.findOne({
      where: {
        id: matchId,
        [Op.or]: [
          { user1_id: req.userId },
          { user2_id: req.userId }
        ]
      }
    });
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    await match.destroy();
    
    res.json({ message: 'Unmatched successfully' });
  } catch (error) {
    next(error);
  }
};
```

## 4. match routes

Tạo file `src/routes/match.js`:

```javascript
const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', matchController.getMatches);
router.delete('/:matchId', matchController.unmatch);

module.exports = router;
```

## 5. chatController.js

Tạo file `src/controllers/chatController.js`:

```javascript
const { ChatSession, Message, User } = require('../models');
const { Op } = require('sequelize');

exports.getChatSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.findAll({
      where: {
        [Op.or]: [
          { user1_id: req.userId },
          { user2_id: req.userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'display_name', 'photo_url']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'display_name', 'photo_url']
        }
      ],
      order: [['updated_at', 'DESC']]
    });
    
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await Message.findAll({
      where: { chat_session_id: sessionId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'display_name', 'photo_url']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { content, type = 'text', imageUrl } = req.body;
    
    if (!content && !imageUrl) {
      return res.status(400).json({ error: 'Content or image URL required' });
    }
    
    // Get session to find recipient
    const session = await ChatSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    const recipientId = session.user1_id === req.userId ? session.user2_id : session.user1_id;
    
    const message = await Message.create({
      chat_session_id: sessionId,
      sender_id: req.userId,
      recipient_id: recipientId,
      content: content || '',
      type,
      image_url: imageUrl,
      status: 'sent'
    });
    
    // Update session timestamp
    await session.update({ updated_at: new Date() });
    
    res.status(201).json({
      message: 'Message sent',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMessageStatus = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    
    if (!['delivered', 'seen'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    await message.update({ status });
    
    res.json({ message: 'Status updated', data: message });
  } catch (error) {
    next(error);
  }
};

exports.revealIdentity = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ChatSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    const updateField = session.user1_id === req.userId ? 'user1_revealed' : 'user2_revealed';
    await session.update({ [updateField]: true });
    
    res.json({
      message: 'Identity revealed',
      session
    });
  } catch (error) {
    next(error);
  }
};
```

## 6. chat routes

Tạo file `src/routes/chat.js`:

```javascript
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', chatController.getChatSessions);
router.get('/:sessionId/messages', chatController.getMessages);
router.post('/:sessionId/message', chatController.sendMessage);
router.put('/message/:messageId/status', chatController.updateMessageStatus);
router.put('/:sessionId/reveal', chatController.revealIdentity);

module.exports = router;
```

Tạo tất cả các file trên và backend sẽ hoàn chỉnh!
