# SafePredict Static Frontend

Versi statis dari SafePredict dashboard yang dapat di-deploy langsung ke GitHub Pages tanpa memerlukan Next.js atau build process.

## 📋 File Structure

```
static-frontend/
├── index.html      # Main HTML page
├── styles.css      # All styling
├── script.js       # JavaScript logic for camera and risk API
└── README.md       # This file
```

## 🚀 Quick Start

### Local Development

1. **Start backend** (di terminal lain):
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Buka dashboard** (pilih satu):
   - **Live Server VS Code**: Right-click `index.html` → "Open with Live Server"
   - **Python HTTP Server**:
     ```bash
     cd static-frontend
     python -m http.server 8080
     ```
     Buka: http://localhost:8080

   - **Direct**: Buka file `index.html` di browser (camera streaming mungkin tidak bekerja karena CORS)

### GitHub Pages Deployment

1. **Copy ke gh-pages branch**:
   ```bash
   # Option 1: Manual copy
   cp -r static-frontend/* docs/
   git add docs/
   git commit -m "Add static frontend"
   git push
   ```

2. **Configure GitHub Pages**:
   - Buka Settings → Pages
   - Pilih branch `main` dan folder `/docs`
   - Atau buat folder `docs` di root dan upload ke sana

3. **Access dashboard**:
   - `https://yourusername.github.io/SafePredict-dicoding-2026/`

## ⚙️ Backend Configuration

Dashboard mencari backend di `http://localhost:8000` secara default. Untuk menggunakan backend yang berbeda:

1. Click tombol **"Change Backend URL"** di panel kamera
2. Masukkan URL backend (misal: `https://safepredict-api.herokuapp.com`)
3. Click "Save"

URL disimpan di localStorage, jadi akan diingat untuk session berikutnya.

## 📹 Camera Streaming

### Fitur
- ✅ Mendukung MJPEG stream dari `/api/camera/stream`
- ✅ Auto-refresh setiap 2 detik
- ✅ Error handling dan retry logic
- ✅ Status indicator (Live bridge / Connection failed)
- ✅ Responsive pada mobile

### Requirements
Backend harus menyediakan:
- `GET /api/camera/stream` → MJPEG stream
- Dukungan CORS atau proxy yang tepat

### Troubleshooting
| Issue | Solution |
|-------|----------|
| Camera tidak muncul | Pastikan backend running di port yang benar |
| "Bridge connection failed" | Check CORS headers di backend |
| Status tetap "Waiting..." | Refresh page, check browser console |

## 📊 Risk Score Integration

Dashboard mengambil live risk score dari:
- **Endpoint**: `POST /api/risk/score`
- **Payload**: Demo area "press-line-1" dengan data shift malam
- **Response**: Risk score, risk band, top factors, recommendation
- **Refresh**: Setiap 30 detik otomatis

Stats akan update dengan data live dari backend jika berhasil terhubung.

## 🔧 File Breakdown

### index.html
- Struktur HTML lengkap
- 2 modes: dengan backend / dengan fallback defaults
- Modal untuk konfigurasi backend URL
- Semantic HTML5 structure

### styles.css
- Dark theme dengan accent warna teal
- CSS Grid layout
- Responsive design (breakpoint di 900px)
- Fixed camera panel di desktop, flexible di mobile
- Backdrop blur dan gradient backgrounds

### script.js
- **50+ lines**: Initialization & event handling
- **Camera**: MJPEG stream dengan retry logic
- **Risk API**: Fetch score dan update UI
- **Configuration**: Simpan backend URL di localStorage
- **Error Handling**: Graceful fallbacks jika API gagal

## 🎯 Use Cases

### 1. Prototipe Lokal
```bash
# Terminal 1: Backend
cd backend && python -m uvicorn app.main:app --reload

# Terminal 2: Static frontend
cd static-frontend && python -m http.server 8080
```
Buka: http://localhost:8080

### 2. Deploy ke GitHub Pages
```bash
cp -r static-frontend/* docs/
git add docs/
git commit -m "Deploy static frontend"
git push origin main
```

### 3. Deploy ke Production (Vercel, Netlify, etc.)
Cukup upload folder `static-frontend` ke service hosting apapun. Tidak perlu build process!

## 📝 Notes

- **No dependencies**: Pure HTML/CSS/JS
- **No build required**: Deploy as-is
- **CORS-aware**: Bisa dikonfigurasi untuk backend apapun
- **Mobile responsive**: Tested di mobile devices
- **Fallback UI**: Jika backend offline, dashboard masih berfungsi dengan demo data

## 🔐 Security Considerations

- Backend URL disimpan di localStorage (jangan simpan credentials)
- All API calls menggunakan CORS mode (backend harus configure CORS)
- HTML di-escape untuk prevent XSS
- No sensitive data di frontend

## 🎨 Customization

Edit `styles.css` untuk mengubah:
- Warna: Edit `:root` CSS variables
- Layout: Adjust grid columns di media queries
- Typography: Font size dan weight

## 📱 Responsive Breakpoints

- **Desktop** (> 900px): Camera panel fixed di kanan, 2-column layout
- **Mobile** (<= 900px): Full width, stacked layout, camera di bawah

---

**Last updated**: April 2026  
**Status**: Production Ready for Prototyping ✅
