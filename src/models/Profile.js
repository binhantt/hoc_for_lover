const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 18,
      max: 100,
    },
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500],
    },
  },
  interests: {
    type: DataTypes.JSON,
    defaultValue: [],
    validate: {
      isValidInterests(value) {
        if (!Array.isArray(value)) {
          throw new Error('Interests must be an array');
        }
        if (value.length < 3) {
          throw new Error('Must have at least 3 interests');
        }
      },
    },
  },
  photo_urls: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  profile_visible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  location_sharing_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  show_online_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'profiles',
  indexes: [
    {
      fields: ['user_id'],
      unique: true,
    },
    {
      fields: ['gender'],
    },
    {
      fields: ['age'],
    },
  ],
});

module.exports = Profile;
