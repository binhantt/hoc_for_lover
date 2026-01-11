const { User, Profile, BlockedUser } = require('../models');
const { Op } = require('sequelize');

exports.getProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const profile = await Profile.findOne({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'display_name', 'photo_url', 'last_active_at']
      }]
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { age, gender, bio, interests, latitude, longitude } = req.body;
    
    const profile = await Profile.findOne({
      where: { user_id: req.userId }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const updateData = {};
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (interests !== undefined) updateData.interests = interests;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    
    await profile.update(updateData);
    
    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePrivacySettings = async (req, res, next) => {
  try {
    const { profileVisible, locationSharingEnabled, showOnlineStatus } = req.body;
    
    const profile = await Profile.findOne({
      where: { user_id: req.userId }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const updateData = {};
    if (profileVisible !== undefined) updateData.profile_visible = profileVisible;
    if (locationSharingEnabled !== undefined) updateData.location_sharing_enabled = locationSharingEnabled;
    if (showOnlineStatus !== undefined) updateData.show_online_status = showOnlineStatus;
    
    await profile.update(updateData);
    
    res.json({
      message: 'Privacy settings updated',
      profile
    });
  } catch (error) {
    next(error);
  }
};

exports.addPhoto = async (req, res, next) => {
  try {
    const { photoUrl } = req.body;
    
    if (!photoUrl) {
      return res.status(400).json({ error: 'Photo URL required' });
    }
    
    const profile = await Profile.findOne({
      where: { user_id: req.userId }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const photoUrls = profile.photo_urls || [];
    photoUrls.push(photoUrl);
    
    await profile.update({ photo_urls: photoUrls });
    
    res.json({
      message: 'Photo added successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};

exports.removePhoto = async (req, res, next) => {
  try {
    const { photoUrl } = req.body;
    
    const profile = await Profile.findOne({
      where: { user_id: req.userId }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const photoUrls = (profile.photo_urls || []).filter(url => url !== photoUrl);
    
    await profile.update({ photo_urls: photoUrls });
    
    res.json({
      message: 'Photo removed successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const { blockedUserId } = req.body;
    
    if (!blockedUserId) {
      return res.status(400).json({ error: 'Blocked user ID required' });
    }
    
    if (blockedUserId === req.userId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }
    
    await BlockedUser.create({
      user_id: req.userId,
      blocked_user_id: blockedUserId
    });
    
    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.unblockUser = async (req, res, next) => {
  try {
    const { blockedUserId } = req.body;
    
    await BlockedUser.destroy({
      where: {
        user_id: req.userId,
        blocked_user_id: blockedUserId
      }
    });
    
    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getBlockedUsers = async (req, res, next) => {
  try {
    const blockedUsers = await BlockedUser.findAll({
      where: { user_id: req.userId },
      include: [{
        model: User,
        as: 'blockedUser',
        attributes: ['id', 'display_name', 'photo_url']
      }]
    });
    
    res.json({ blockedUsers });
  } catch (error) {
    next(error);
  }
};
