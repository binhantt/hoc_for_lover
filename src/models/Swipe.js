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
