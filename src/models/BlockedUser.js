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
