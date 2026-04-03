# 🎨 Ethereal Tone - Email Tone Improver

An AI-powered web application that analyzes and rewrites emails in multiple signature tones using Google's Gemini API. Features user authentication, conversation history, and an admin panel.

🌐 **Live Demo:** [email-tone-improver.vercel.app](https://email-tone-improver.vercel.app)

[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://email-tone-improver.vercel.app)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Gemini API Key** ([get free key](https://ai.google.dev/))
- **Supabase Project** ([free tier](https://supabase.com/))

### Setup (4 Steps)

1. **Clone and Install:**
```powershell
git clone https://github.com/YOUR_USERNAME/ethereal-tone-improver.git
cd ethereal-tone-improver
npm install
```

2. **Configure Environment:**
```powershell
Copy-Item .env.example -Destination .env
```
Edit `.env` with your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_key_here
JWT_SECRET=your-strong-random-secret-min-32-chars
ADMIN_EMAIL=admin@etherealtone.ai
ADMIN_PASSWORD_HASH=your-bcrypt-admin-password-hash
```

3. **Setup Supabase Tables:**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'user',
  total_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversation history
CREATE TABLE history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  improved_email TEXT,
  selected_tone VARCHAR,
  clarity_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. **Run Server:**
```powershell
npm start
```

Open **http://localhost:3000** in your browser.

---

## 📋 Project Structure

```
.
├── index.html                 # Landing page
├── login.html                 # User login with JWT
├── register.html              # User registration
├── editor.html                # Main tone improver (authenticated)
├── profile.html               # User profile & history
├── admin-login.html           # Admin authentication
├── admin.html                 # Admin dashboard
├── how-it-works.html          # Process explanation
├── privacy-policy.html        # Privacy policy
├── terms.html                 # Terms of service
├── server.js                  # Express server + routing
├── db.js                      # Supabase client
├── package.json               # Dependencies
├── .env.example               # Environment template
├── .env                       # Local config (NOT in GitHub)
├── .gitignore                 # Git exclusions
├── api/
│   ├── auth.js                # JWT authentication, register/login
│   ├── enhance.js             # Gemini API tone enhancement
│   ├── history.js             # Conversation history CRUD
│   ├── admin.js               # Admin operations (soft delete, stats)
│   └── middleware.js          # JWT verification, rate limiting
├── models/
│   ├── User.js                # User database operations
│   └── History.js             # History database operations
└── README.md                  # This file
```

---

## ✨ Features

### 🎯 Core Features
- 🤖 **AI-Powered Tone Analysis** - Uses Google Gemini 2.5 Flash
- 📧 **Email Rewriting** - 12 signature tones available
- 📊 **Smart Metrics** - Clarity scores & tone resonance ratings
- 🔄 **Visual Diff** - Highlight exactly what changed
- 🎨 **Modern UI** - Dark glassmorphic design
- ⚡ **Real-time** - Instant email rewrites

### 🔐 Authentication & Security
- ✅ **JWT-Based Auth** - Secure stateless authentication
- 🔒 **Password Hashing** - Bcrypt with salt
- 🛡️ **Rate Limiting** - 3-tier protection (100/15min general, 5/15min auth)
- ✔️ **XSS Protection** - DOMPurify sanitization
- 🍪 **HTTP-only Cookies** - Secure token storage
- 📋 **Input Validation** - Email regex & length checks

### 👤 User Features
- 📝 **User Accounts** - Register with email & password (12+ chars)
- 💾 **Conversation History** - All rewrites saved & searchable
- 👤 **Profile Page** - View account info & tone preferences
- 🎯 **Remember Session** - Auto-login within 7 days
- 🔊 **Text-to-Speech** - Listen to improved emails

### ⚙️ Admin Features
- 👥 **User Management** - View all users & stats
- 📊 **System Analytics** - Total users, conversions, tone popularity
- 🗑️ **Soft Delete** - Remove user conversions (audit trail preserved)
- 👤 **User Deletion** - Remove accounts with cascade delete
- 🔐 **Secure Admin Portal** - Protected by admin credentials

### Tones Supported
Professional • Formal • Friendly • Casual • Concise • Persuasive • Apologetic • Urgent • Grateful • Authoritative • Collaborative • Humorous

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/auth/register` | Create new account | ❌ No |
| POST | `/api/auth/login` | Login user | ❌ No |
| POST | `/api/auth/logout` | Logout & clear token | ✅ JWT |
| GET | `/api/auth/me` | Get current user info | ✅ JWT |

### Tone Enhancement
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/enhance` | Rewrite email in tone | ✅ JWT |

### History & Profile
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/history` | Get user's conversions | ✅ JWT |
| POST | `/api/history` | Save new conversion | ✅ JWT |
| DELETE | `/api/history/:id` | Delete conversion | ✅ JWT |

### Admin Only
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/admin/login` | Admin authentication | ❌ No |
| GET | `/api/admin/users` | List all users | ✅ JWT + Role |
| GET | `/api/admin/stats` | System statistics | ✅ JWT + Role |
| GET | `/api/admin/user-history/:userId` | User's conversions | ✅ JWT + Role |
| DELETE | `/api/admin/history/:id` | Soft delete entry | ✅ JWT + Role |
| DELETE | `/api/admin/user/:userId` | Delete user account | ✅ JWT + Role |
| GET | `/api/admin/tone-stats` | Tone popularity | ✅ JWT + Role |

### Example: POST /api/enhance
**Request:**
```json
{
  "sourceText": "Your email text here",
  "selectedTone": "Professional"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "improved_email": "<p>Rewritten email...</p>",
  "diff_html": "<span class='diff-removed'>old</span> <span class='diff-added'>new</span>",
  "improvements": ["Key improvement #1", "Key improvement #2"],
  "clarity_score": 92,
  "tone_resonance": 98,
  "created_at": "2026-04-03T12:00:00Z"
}
```

---

## 🔐 **SECURITY** 

⚠️ **IMPORTANT: Before deploying to Vercel, read [SECURITY_DEPLOYMENT_GUIDE.md](SECURITY_DEPLOYMENT_GUIDE.md)**

**Key Security Features:**
- ✅ JWT authentication with 32+ char secrets
- ✅ Bcrypt password hashing (salt=10)
- ✅ HTTP-only secure cookies
- ✅ CORS whitelist protection
- ✅ Rate limiting (3-tier system)
- ✅ RLS policies on Supabase
- ✅ Environment variable validation
- ✅ Production vs development error handling

**CVE Status:**
- ✅ API Key URL Exposure - Documented with mitigation
- ✅ JWT Secret Validation - ENFORCED
- ✅ Admin Password Hashing - IMPLEMENTED
- ✅ CORS Bypass - PROTECTED
- ✅ Sensitive Logging - CONTROLLED

---
| Layer | Method | Status |
|-------|--------|--------|
| **Transit** | HTTPS (Vercel + Let's Encrypt) | 🛡️ Protected |
| **Storage** | PostgreSQL + Supabase encryption | 🔒 Encrypted |
| **Passwords** | Bcrypt hashing (salt: 10) | ✅ Hashed |
| **Tokens** | JWT HS256 algorithm (7-day expiry) | 🔐 Signed |
| **Cookies** | HTTP-only, Secure, SameSite=strict | 🍪 Safe |

### Input Validation
- ✅ Email regex validation
- ✅ Password length enforcement (12+ chars required)
- ✅ Pagination bounds checking (max 100)
- ✅ Text length validation (1-10000 chars)
- ✅ XSS protection via DOMPurify

### Rate Limiting
```
General endpoints:    100 requests / 15 minutes
Auth endpoints:       5 requests / 15 minutes  
Enhancement API:      10 requests / 5 minutes
```

### Protected (NOT in GitHub)
- `.env` - All sensitive credentials
- `node_modules/` - Dependencies (regenerated)
- Redis cache data

### Shared (In GitHub)
- `.env.example` - Safe template only
- `package.json` - Public dependencies
- All source code & HTML files
- Documentation & configs

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first styling
- **Vanilla JavaScript** - No framework bloat
- **DOMPurify** - XSS protection
- **Material Symbols** - Icon system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JWT (jsonwebtoken)** - Token authentication
- **express-rate-limit** - Rate limiting
- **cookie-parser** - Secure cookies
- **dotenv** - Environment management

### Database
- **Supabase** - PostgreSQL backend
- **Soft Deletes** - Audit trail preservation
- **Foreign Keys** - Data integrity

### AI & APIs
- **Google Gemini 2.5** - Text generation & analysis
- **Web Speech API** - Text-to-speech

### Deployment
- **Vercel** - Serverless functions
- **GitHub** - Version control & CI/CD

---

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module 'express'" | Run `npm install` |
| "Cannot connect to Supabase" | Check SUPABASE_URL & SUPABASE_ANON_KEY in .env |
| "Invalid JWT token" | Token expired (7-day limit). Login again. |
| "Email already exists" | Use a different email or login with existing account. |
| "Password must be 12+" | Create strong password with 12+ characters. |
| "Port 3000 already in use" | `netstat -ano \| findstr :3000` → `taskkill /PID <PID> /F` |
| "Too many login attempts" | Rate limiter triggered. Wait 15 minutes. |
| "CORS error" | Add FRONTEND_URL to environment & Supabase CORS settings |
| API returns 401 | JWT expired or missing. Clear cookies & login again. |
| Admin login fails | Verify ADMIN_EMAIL & ADMIN_PASSWORD_HASH match .env |

---

## 🚀 Deployment to Vercel

### Environment Variables
Set these on Vercel (Settings → Environment Variables):
```
GEMINI_API_KEY        = your_gemini_key
SUPABASE_URL          = https://your-project.supabase.co
SUPABASE_ANON_KEY     = your_supabase_key
JWT_SECRET            = your-random-secret-32-chars
ADMIN_EMAIL           = admin@etherealtone.ai
ADMIN_PASSWORD_HASH   = your-bcrypt-admin-password-hash
NODE_ENV              = production
FRONTEND_URL          = https://your-app.vercel.app
```

### Deploy Steps
```powershell
# 1. Commit & push to GitHub
git add .
git commit -m "Ethereal Tone with JWT & Supabase"
git push origin main

# 2. Connect to Vercel
#    - Go to vercel.com/import
#    - Select GitHub repo
#    - Add environment variables above
#    - Deploy!

# 3. Verify production
#    - Test login/register
#    - Check admin panel
#    - Test tone enhancement
```

---

## 💡 Tips & Tricks

- **Dark Mode** - Auto-detects system preference
- **Password Visibility** - Click eye icon to toggle on login/register
- **Text-to-Speech** - Click speaker icon to hear improved emails
- **Copy Output** - Use copy button for clipboard
- **Visual Diff** - See old vs new text highlighted
- **Admin Access** - Go to `/admin-login` with credentials
- **Conversation History** - View past improvements in profile
- **Quick Register** - Click "Sign Up" link from login page

---

## 🐚 Development

### Local Testing
```powershell
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"SecurePass123"}'

# Test tone enhancement
curl -X POST http://localhost:3000/api/enhance \
  -H "Content-Type: application/json" \
  -d '{"sourceText":"hey","selectedTone":"Professional"}'
```

---

## 📚 Resources

- **Gemini API** - https://ai.google.dev/
- **Supabase Docs** - https://supabase.com/docs
- **Express.js** - https://expressjs.com/
- **JWT.io** - https://jwt.io/
- **Tailwind CSS** - https://tailwindcss.com/

---

## 📝 License

© 2026 Ethereal Tone AI. MIT License - See [LICENSE](LICENSE) file.

---

## 🤝 Contributing

We welcome contributions! Please:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Guidelines
- Follow existing code style
- Test before submitting PR
- Update README if adding features
- Keep commits atomic & descriptive

---

## 📧 Support & Feedback

- 🐛 **Found a bug?** - Open an issue on GitHub
- 💡 **Have an idea?** - Suggest features via GitHub discussions
- ❓ **Have questions?** - Check documentation or open a Q&A issue

---

## 🎯 Roadmap

- ✅ JWT Authentication
- ✅ Conversation History
- ✅ Admin Dashboard
- ✅ Soft Delete System
- ✅ Rate Limiting
- 🚧 Email integration (Gmail, Outlook)
- 🚧 Team collaboration
- 🚧 Custom tone creation
- 🚧 Mobile app
- 🚧 Bulk email processing

---

**Made with ❤️ by the Ethereal Tone team**

Enjoy refining your digital voice! 🚀
