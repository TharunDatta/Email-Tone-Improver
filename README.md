# 🎨 Ethereal Tone - Email Tone Improver

An AI-powered web application that analyzes and rewrites emails in multiple signature tones using Google's Gemini API.

[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Gemini API Key** ([get free key](https://ai.google.dev/))

### Setup (3 Steps)

1. **Clone and Install:**
```powershell
git clone https://github.com/YOUR_USERNAME/ethereal-tone-improver.git
cd ethereal-tone-improver
npm install
```

2. **Configure API Key:**
```powershell
Copy-Item .env.example -Destination .env
```
Then edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

3. **Run Server:**
```powershell
npm start
```

Open **http://localhost:3000** in your browser.

---

## 📋 Project Structure

```
.
├── index.html                 # Landing page
├── editor.html                # Main tone improver interface
├── how-it-works.html          # Process explanation
├── privacy-policy.html        # Privacy policy
├── terms.html                 # Terms of service
├── server.js                  # Express server
├── package.json               # Dependencies
├── .env.example               # Environment template
├── .env                       # Local API key (NOT in GitHub)
├── .gitignore                 # Git exclusions
├── api/
│   └── enhance.js             # Gemini API handler
└── README.md                  # This file
```

---

## ✨ Features

- 🤖 **AI-Powered Analysis** - Uses Google Gemini 2.5 Flash
- 🎨 **Modern UI** - Dark glassmorphic design
- 📊 **Metrics** - Clarity scores and tone resonance ratings
- 🔄 **Visual Diff** - See exactly what changed
- 🎯 **12 Tones** - Professional, Friendly, Urgent, Humorous, and more
- 🔐 **Secure** - XSS-protected HTML output
- ⚡ **Real-time** - Instant email rewrites

### Available Tones
- Professional
- Formal
- Friendly
- Casual
- Concise
- Persuasive
- Apologetic
- Urgent
- Grateful
- Authoritative
- Collaborative
- Humorous

---

## 📖 Popular Pages

| URL | Purpose |
|-----|---------|
| `/` | Landing page with features |
| `/editor.html` | Main tone improver tool |
| `/how-it-works.html` | How it works explanation |
| `/privacy-policy.html` | Privacy policy |
| `/terms.html` | Terms of service |

---

## 🔌 API Endpoint

**POST** `/api/enhance`

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
  "improved_email": "<p>Rewritten email...</p>",
  "diff_html": "<span class='diff-removed'>old</span> <span class='diff-added'>new</span>",
  "improvements": [
    "Key improvement #1",
    "Key improvement #2",
    "Key improvement #3"
  ],
  "clarity_score": 92,
  "tone_resonance": 98
}
```

---

## 🔐 Security & Environment

### Protected (NOT in GitHub)
- `.env` - Contains your personal API key  
- `node_modules/` - Regenerated from package.json

### Shared (In GitHub)
- `.env.example` - Template for configuration
- `package.json` - Dependency manifest
- All code files (HTML, CSS, JS)

### For Cloning
When others clone your repo, they need to:
1. Run `npm install`
2. Create `.env` from `.env.example`
3. Add their own Gemini API key
4. Run `npm start`

👉 **See [GITHUB_DEPLOYMENT.md](GITHUB_DEPLOYMENT.md) for full GitHub setup instructions**

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module 'express'" | Run `npm install` |
| "API key is missing" | Create `.env` from `.env.example`, add your key |
| "Port 3000 already in use" | `netstat -ano \| findstr :3000` then `taskkill /PID <PID> /F` |
| API returns error | Check internet connection and API key validity |

---

## 🛠️ Development

### Scripts
```powershell
npm start    # Run server
npm run dev  # Run with auto-reload (requires --watch flag)
```

### Tech Stack
- **Frontend:** HTML5, Tailwind CSS, Vanilla JS
- **Backend:** Node.js, Express, Dotenv
- **AI:** Google Gemini 2.5 Flash API
- **Security:** DOMPurify (XSS protection)

---

## 💡 Tips

- **Dark Mode:** Auto-detects system preference
- **Text-to-Speech:** Click speaker icon to hear emails
- **Copy Output:** Use copy button to save improved emails
- **Multiple Tones:** Quickly switch between tone options
- **Visual Feedback:** Real-time processing animations

---

## 📝 License

© 2026 Ethereal Tone AI. All rights reserved.

---

## 🤝 Contributing

Contributions welcomed! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to GitHub
5. Create a Pull Request

---

## 📧 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [Gemini API docs](https://ai.google.dev/)
3. Create an Issue on GitHub

---

## 🎯 What's Next?

- Deploy to Vercel or Netlify
- Add user authentication
- Save tone preferences
- Export to PDF
- Integration with Gmail/Outlook

Enjoy refining your digital voice! 🚀
