# Panduan Deployment Static Frontend SafePredict

## 🚀 Option 1: GitHub Pages (Recommended untuk Prototype)

### Prerequisites
- Git repository sudah ter-setup
- GitHub account dengan access ke repository

### Steps

#### Step 1: Copy Static Frontend ke `docs/` folder

```bash
# Dari root project
mkdir -p docs
cp -r static-frontend/* docs/
```

#### Step 2: Push ke GitHub

```bash
git add docs/
git commit -m "Add SafePredict static frontend for GitHub Pages"
git push origin main
```

#### Step 3: Enable GitHub Pages

1. Go to: `https://github.com/RizalAnditama/SafePredict-dicoding-2026/settings/pages`
2. Pilih:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/docs`
3. Click "Save"
4. GitHub akan rebuild dan publish dalam ~1-2 menit

#### Step 4: Access Dashboard

Dashboard akan tersedia di:
```
https://RizalAnditama.github.io/SafePredict-dicoding-2026/
```

---

## 🚀 Option 2: Vercel (Jika ingin Serverless + Backend)

Meskipun frontend sudah statis, kamu bisa tetap deploy ke Vercel:

```bash
cd static-frontend
vercel deploy
```

---

## 🚀 Option 3: Netlify

1. Drag & drop folder `static-frontend` ke [Netlify](https://app.netlify.com/)
2. Done! Dashboard langsung live

---

## 🚀 Option 4: Local HTTP Server (Development)

### Python 3:
```bash
cd static-frontend
python -m http.server 8080
```

### Python 2:
```bash
cd static-frontend
python -m SimpleHTTPServer 8080
```

### Node.js:
```bash
npm install -g http-server
cd static-frontend
http-server -p 8080
```

Buka: http://localhost:8080

---

## 🔧 Backend Configuration untuk Production

Ketika di-deploy ke production, dashboard akan mencari backend di `http://localhost:8000` (default).

Untuk menggunakan backend production:

1. **Option A**: Ubah default di `script.js`
   ```javascript
   const DEFAULT_BACKEND_URL = 'https://safepredict-api.herokuapp.com';
   ```

2. **Option B**: User bisa set via UI button "Change Backend URL"

### CORS Requirement

Backend harus enable CORS:

**Backend FastAPI** (`app/main.py`):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # atau specify domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📋 Verification Checklist

- [ ] Static frontend berfungsi di localhost
- [ ] Backend API berfungsi
- [ ] Camera stream berfungsi
- [ ] Risk score API berfungsi
- [ ] Semua file ter-copy ke `docs/` atau `static-frontend/`
- [ ] GitHub Pages ter-enable dan built
- [ ] Backend URL sudah dikonfigurasi untuk production

---

## 🆘 Troubleshooting

### Camera tidak muncul
```
→ Check backend sedang running
→ Check /api/camera/stream endpoint berfungsi
→ Check browser console untuk error messages
→ Click "Change Backend URL" dan verifikasi URL
```

### Risk score tidak update
```
→ Verify /api/risk/score endpoint berfungsi
→ Check Network tab di DevTools
→ Verify CORS headers
```

### GitHub Pages tidak update
```
→ Verify file sudah di-push ke docs/ folder
→ Wait 1-2 minutes untuk rebuild
→ Hard refresh (Ctrl+Shift+R)
→ Check "Actions" tab untuk build status
```

### Deployment ke multiple env

```bash
# Development (localhost)
cd static-frontend && python -m http.server 8080
# Backend: http://localhost:8000

# Staging (GitHub Pages)
# Deployed to: github.io
# Backend: staging-api.example.com (set via UI)

# Production
# Deployed to: safepredict.example.com
# Backend: prod-api.example.com (set via UI)
```

---

## 📝 File Locations

```
SafePredict-dicoding-2026/
├── static-frontend/          ← Source
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── README.md
│   └── DEPLOYMENT.md         ← This file
│
└── docs/                      ← GitHub Pages (auto-synced)
    ├── index.html            ← Copy dari static-frontend/
    ├── styles.css
    ├── script.js
    └── README.md
```

---

## 🎯 Next Steps

1. ✅ Buat static frontend (DONE)
2. ⏭️ Test di localhost
3. ⏭️ Deploy ke GitHub Pages
4. ⏭️ Configure production backend
5. ⏭️ Share link dengan team/mentor

---

**Dibuat**: April 2026  
**Status**: Ready for Deployment 🚀
