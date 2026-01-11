# Tạo Các Models Còn Lại

Tạo các file sau trong folder `src/models/`:

## 1. Swipe.js
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Swipe = sequelize.define('Swipe', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  target_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  action: {
    type: DataTypes.ENUM('like', 'skip'),
    allowNull: false,
  },
  swiped_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'swipes',
  indexes: [
    { fields: ['user_id', 'target_user_id'], unique: true },
    { fields: ['user_id', 'swiped_at'] },
  ],
});

module.exports = Swipe;
```

## 2. SwipeLimit.js
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SwipeLimit = sequelize.define('SwipeLimit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' },
  },
  swipe_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_swipe_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  is_vip: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'swipe_limits',
});

module.exports = SwipeLimit;
```

## 3. ChatSession.js
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatSession = sequelize.define('ChatSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user1_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  user2_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  user1_revealed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  user2_revealed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'chat_sessions',
  indexes: [
    { fields: ['user1_id', 'user2_id'], unique: true },
  ],
});

module.exports = ChatSession;
```

## 4. Message.js
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  chat_session_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'chat_sessions', key: 'id' },
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  recipient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'emoji'),
    defaultValue: 'text',
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'seen'),
    defaultValue: 'sent',
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'messages',
  indexes: [
    { fields: ['chat_session_id', 'created_at'] },
    { fields: ['recipient_id', 'status'] },
  ],
});

module.exports = Message;
```

## 5. BlockedUser.js
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlockedUser = sequelize.define('BlockedUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  blocked_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  blocked_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'blocked_users',
  indexes: [
    { fields: ['user_id', 'blocked_user_id'], unique: true },
  ],
});

module.exports = BlockedUser;
```

## 6. Report.js
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reporter_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  reported_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'resolved'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'reports',
  indexes: [
    { fields: ['reporter_id'] },
    { fields: ['reported_user_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Report;
```

Tạo tất cả các file trên trong folder `src/models/`!
