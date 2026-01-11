const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Match = sequelize.define('Match', {
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
  chat_session_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  matched_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'matches',
  indexes: [
    { fields: ['user1_id'] },
    { fields: ['user2_id'] },
    { fields: ['matched_at'] },
  ],
});

module.exports = Match;
