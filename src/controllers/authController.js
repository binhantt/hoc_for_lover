const { User, Profile } = require('../models');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Create user
    const user = await User.create({
      email,
      password,
      display_name: displayName || email.split('@')[0],
      provider: 'email'
    });
    
    // Create empty profile
    await Profile.create({
      user_id: user.id,
      age: 0,
      gender: 'other',
      interests: []
    });
    
    const token = generateToken(user.id);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    // Update last active
    await user.update({ last_active_at: new Date() });
    
    const token = generateToken(user.id);
    
    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { email, displayName, photoUrl, providerId } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Create new user
      user = await User.create({
        email,
        display_name: displayName || email.split('@')[0],
        photo_url: photoUrl,
        provider: 'google',
        provider_id: providerId,
        is_verified: true
      });
      
      // Create empty profile
      await Profile.create({
        user_id: user.id,
        age: 0,
        gender: 'other',
        interests: []
      });
    }
    
    // Update last active
    await user.update({ last_active_at: new Date() });
    
    const token = generateToken(user.id);
    
    res.json({
      message: 'Google authentication successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{
        model: Profile,
        as: 'profile'
      }]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  // JWT is stateless, so just return success
  // Client should delete the token
  res.json({ message: 'Logged out successfully' });
};

exports.updateLastActive = async (req, res, next) => {
  try {
    await User.update(
      { last_active_at: new Date() },
      { where: { id: req.userId } }
    );
    
    res.json({ message: 'Last active updated' });
  } catch (error) {
    next(error);
  }
};
