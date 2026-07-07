# 🎌 OtakuBate - Your Anime Community

![OtakuBate Banner](https://files.catbox.moe/92x357.png)

<div align="center">

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://otakubate.name.ng)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://otakubate.onrender.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)

**The Ultimate Social Network for Anime Fans** 🚀

[Visit OtakuBate](https://otakubate.name.ng) · [Join Discord](https://discord.gg/GASuyBbtV) · [Telegram Bot](https://t.me/OtakuBateBot)

</div>

---

## 📖 About OtakuBate

OtakuBate is a **full-featured anime social network** where fans can:

- 🌟 **Discover & Discuss** - Explore trending anime and share your thoughts
- 👥 **Join Communities** - Connect with fans who share your interests
- 💬 **Real-time Chat** - Message other fans instantly
- 📝 **Share Content** - Post reviews, reactions, fan art, and hot takes
- 🎌 **Anime Discovery** - Find your next favorite series with our built-in anime API
- 🏆 **Build Your Profile** - Customize your avatar, banner, and showcase your favorite anime

---

## ✨ Features

### 🎬 Anime Discovery
- Browse trending anime, top-rated, upcoming, and movies
- Search thousands of anime titles
- View detailed anime info including scores, genres, and synopsis

### 👤 User Experience
- Google OAuth authentication
- Customizable profiles with avatars and banners
- Follow system & activity feed
- Email verification & password reset

### 💬 Social Features
- Create posts with images and tags
- Like, comment, and share content
- Real-time direct messaging with typing indicators
- Notification system for likes, comments, and follows

### 🎌 OtakuHub Communities
- Create and join anime clubs
- Club discussions with reactions
- Admin & moderation tools (promote, demote, ban)

### 🛡️ Security
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- Admin dashboard for moderation

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| **React + TypeScript** | UI Framework |
| **Vite** | Build Tool |
| **TanStack Query** | Data Fetching & Caching |
| **Tailwind CSS** | Styling |
| **Socket.io Client** | Real-time Features |
| **Zustand** | State Management |
| **Recharts** | Admin Dashboard Charts |

### Backend
| Tech | Purpose |
|------|---------|
| **Node.js + Express** | Server Framework |
| **MongoDB + Mongoose** | Database |
| **Passport.js** | Google OAuth |
| **Socket.io** | WebSocket Server |
| **JWT** | Authentication |
| **Bcrypt** | Password Hashing |
| **Nodemailer + Brevo** | Email Delivery |
| **Cloudinary** | Image Hosting |

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [otakubate.name.ng](https://otakubate.name.ng) |
| **Admin Panel** | [otakubate.name.ng/admin](https://otakubate.name.ng/admin) |
| **Backend API** | [otakubate.onrender.com](https://otakubate.onrender.com) |
| **API Health** | [otakubate.onrender.com/api/health](https://otakubate.onrender.com/api/health) |

---

## 📁 Project Structure

```
otakubate/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Passport config
│   │   ├── middleware/     # Auth, Rate limiting, Admin
│   │   ├── models/         # User, Post, Comment, etc.
│   │   ├── routes/         # API routes
│   │   ├── modules/        # OtakuHub (clubs) module
│   │   └── services/       # Email, Notification services
│   └── public/             # Default avatars/banners
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── modules/        # OtakuHub feature module
│   │   ├── lib/            # API client, Socket setup
│   │   └── stores/         # Zustand stores
│   └── public/             # Static assets
```

---

## 🏃‍♂️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)
- Brevo account (for emails)

### Environment Variables

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/otakubate
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
BREVO_API_KEY=your_brevo_key
BREVO_SENDER_EMAIL=sender@email.com
BREVO_SENDER_NAME=OtakuBate
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Installation

```bash
# Clone the repository
git clone https://github.com/daddymaou/otakubate.git
cd otakubate

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Run development servers
# Backend (from backend folder)
npm run dev

# Frontend (from frontend folder)
npm run dev
```

---

## 📊 Admin Dashboard

Access the admin panel at `/admin` (requires `isAdmin: true`).

**Features:**
- 📈 **Dashboard** - Real-time stats with charts
- 👥 **User Management** - Ban, unban, promote to admin
- 📝 **Content Moderation** - Delete posts and comments
- 🎌 **Club Management** - View and delete clubs

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is **open-source** and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Jikan API](https://jikan.moe/) for anime data
- [Catbox](https://catbox.moe/) for image hosting
- All the anime fans who made this possible!

---

## 📬 Contact

- **Developer:** [ᗰᗩOᑌ](https://maou.name.ng/)
- **Telegram Support:** [@OtakuBateBot](https://t.me/OtakuBateBot)
- **Telegram Channel:** [@otakubate](https://t.me/otakubate)
- **Discord:** [Join Server](https://discord.gg/GASuyBbtV)

---

<div align="center">
  <sub>Developed by MaouKnowsJava</sub>
  <br />
  <sub>© 2026 OtakuBate</sub>
</div>
