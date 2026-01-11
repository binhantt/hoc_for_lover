# ForLove Backend API

Backend API cho ứng dụng hẹn hò ForLove, xây dựng với Node.js, Express, MySQL và Sequelize.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Create database
mysql -u root -p
CREATE DATABASE forlove_db;

# Run server
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

## 📦 Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Socket.IO** - Real-time chat
- **Multer** - File upload

## 📚 Documentation

- [Setup Guide](./SETUP_BACKEND.md) - Hướng dẫn setup chi tiết
- [Create Models](./CREATE_REMAINING_MODELS.md) - Tạo các models còn lại
- [API Documentation](./API_DOCS.md) - API endpoints

## 🗄️ Database Models

- User - Thông tin user
- Profile - Profile chi tiết
- Match - Matches giữa users
- Swipe - Lịch sử swipe
- SwipeLimit - Giới hạn swipe hàng ngày
- ChatSession - Phiên chat
- Message - Tin nhắn
- BlockedUser - Users bị block
- Report - Báo cáo vi phạm

## 🔐 Authentication

API sử dụng JWT tokens. Include token trong header:
```
Authorization: Bearer YOUR_TOKEN
```

## 📝 License

MIT
