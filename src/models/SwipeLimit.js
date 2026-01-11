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
