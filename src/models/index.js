const { sequelize } = require('../config/database');
const User = require('./User');
const Profile = require('./Profile');
const Match = require('./Match');
const Swipe = require('./Swipe');
const SwipeLimit = require('./SwipeLimit');
const ChatSession = require('./ChatSession');
const Message = require('./Message');
const BlockedUser = require('./BlockedUser');
const Report = require('./Report');

// Define associations
User.hasOne(Profile, { foreignKey: 'user_id', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Swipe, { foreignKey: 'user_id', as: 'swipes' });
Swipe.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Match, { foreignKey: 'user1_id', as: 'matchesAsUser1' });
User.hasMany(Match, { foreignKey: 'user2_id', as: 'matchesAsUser2' });
Match.belongsTo(User, { foreignKey: 'user1_id', as: 'user1' });
Match.belongsTo(User, { foreignKey: 'user2_id', as: 'user2' });

User.hasOne(SwipeLimit, { foreignKey: 'user_id', as: 'swipeLimit' });
SwipeLimit.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

ChatSession.hasMany(Message, { foreignKey: 'chat_session_id', as: 'messages' });
Message.belongsTo(ChatSession, { foreignKey: 'chat_session_id', as: 'chatSession' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

User.hasMany(BlockedUser, { foreignKey: 'user_id', as: 'blockedUsers' });
BlockedUser.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Report, { foreignKey: 'reporter_id', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });

module.exports = {
  sequelize,
  User,
  Profile,
  Match,
  Swipe,
  SwipeLimit,
  ChatSession,
  Message,
  BlockedUser,
  Report,
};
