# Setup Backend ForLove - Node.js + MySQL + Sequelize

## 📦 Cấu Trúc Project

```
forlove-backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── Match.js
│   │   ├── Swipe.js
│   │   ├── SwipeLimit.js
│   │   ├── ChatSession.js
│   │   ├── Message.js
│   │   ├── BlockedUser.js
│   │   └── Report.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── swipeController.js
│   │   ├── matchController.js
│   │   └── chatController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── swipe.js
│   │   ├── match.js
│   │   └── chat.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── helpers.js
│   └── server.js
├── uploads/
├── .env
├── .env.example
├── .gitignore
└── package.json
```

## 🚀 Bước 1: Cài Đặt Dependencies

```bash
cd forlove-backend
npm install
```

## 🗄️ Bước 2: Setup MySQL Database

### Tạo Database

```sql
CREATE DATABASE forlove_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Cấu Hình .env

Copy `.env.example` thành `.env`:
```bash
cp .env.example .env
```

Sửa file `.env`:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=forlove_db
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

CORS_ORIGIN=*
SOCKET_PORT=3001
```

## 📝 Bước 3: Tạo Các Models

Tạo tất cả models theo file `CREATE_REMAINING_MODELS.md`.

Các models đã có:
- ✅ User.js
- ✅ Profile.js
- ✅ Match.js
- ✅ index.js

Cần tạo thêm:
- [ ] Swipe.js
- [ ] SwipeLimit.js
- [ ] ChatSession.js
- [ ] Message.js
- [ ] BlockedUser.js
- [ ] Report.js

## 🔧 Bước 4: Tạo Server

### src/server.js
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { testConnection, sequelize } = require('./config/database');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const swipeRoutes = require('./routes/swipe');
const matchRoutes = require('./routes/match');
const chatRoutes = require('./routes/chat');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'ForLove API Server' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/chat', chatRoutes);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await testConnection();
    
    // Sync database (development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synced');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

## 🔐 Bước 5: Tạo Middleware

### src/middleware/auth.js
```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;
```

### src/middleware/errorHandler.js
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => e.message),
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Resource already exists',
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
```

## 🛣️ Bước 6: Tạo Routes và Controllers

### src/routes/auth.js
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.get('/me', auth, authController.getMe);
router.post('/logout', auth, authController.logout);

module.exports = router;
```

### src/controllers/authController.js
```javascript
const { User, Profile } = require('../models');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    
    const user = await User.create({
      email,
      password,
      display_name: displayName,
      provider: 'email',
    });
    
    // Create empty profile
    await Profile.create({
      user_id: user.id,
      age: 0,
      gender: 'other',
      interests: [],
    });
    
    const token = generateToken(user.id);
    
    res.status(201).json({
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last active
    await user.update({ last_active_at: new Date() });
    
    const token = generateToken(user.id);
    
    res.json({
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { email, displayName, photoUrl, providerId } = req.body;
    
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      user = await User.create({
        email,
        display_name: displayName,
        photo_url: photoUrl,
        provider: 'google',
        provider_id: providerId,
        is_verified: true,
      });
      
      await Profile.create({
        user_id: user.id,
        age: 0,
        gender: 'other',
        interests: [],
      });
    }
    
    await user.update({ last_active_at: new Date() });
    
    const token = generateToken(user.id);
    
    res.json({
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{ model: Profile, as: 'profile' }],
    });
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
```

## 🏃 Bước 7: Chạy Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 🧪 Bước 8: Test API

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Profile
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/photo` - Upload photo
- `DELETE /api/profile/photo/:photoId` - Delete photo

### Swipe
- `GET /api/swipe/potential` - Get potential matches
- `POST /api/swipe` - Record swipe
- `GET /api/swipe/remaining` - Get remaining swipes

### Match
- `GET /api/match` - Get user matches
- `DELETE /api/match/:matchId` - Unmatch

### Chat
- `GET /api/chat` - Get chat sessions
- `GET /api/chat/:sessionId/messages` - Get messages
- `POST /api/chat/:sessionId/message` - Send message
- `PUT /api/chat/:sessionId/reveal` - Reveal identity

## 🔒 Security

- ✅ Helmet for security headers
- ✅ CORS configured
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ SQL injection protection (Sequelize)

## 📊 Database Schema

Xem file `DATABASE_SCHEMA.sql` để có schema đầy đủ.

## 🚀 Deploy

### Heroku
```bash
heroku create forlove-api
heroku addons:create cleardb:ignite
git push heroku main
```

### Railway
```bash
railway init
railway add
railway up
```

## 🎉 Hoàn Thành!

Backend đã sẵn sàng! Giờ có thể kết nối Flutter app với API này.
