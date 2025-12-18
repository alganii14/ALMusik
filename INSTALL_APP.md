# Cara Install ALMusik di HP

## Metode 1: Install dari Browser (Paling Mudah)

### Android (Chrome)
1. Buka `https://al-musik.vercel.app/mobile` di Chrome
2. Tap menu (⋮) di pojok kanan atas
3. Pilih **"Install app"** atau **"Add to Home screen"**
4. Tap **"Install"**
5. Aplikasi akan muncul di home screen

### iPhone/iPad (Safari)
1. Buka `https://al-musik.vercel.app/mobile` di **Safari** (wajib Safari!)
2. Tap tombol **Share** (kotak dengan panah ke atas)
3. Scroll ke bawah, pilih **"Add to Home Screen"**
4. Tap **"Add"**
5. Aplikasi akan muncul di home screen

---

## Metode 2: Halaman Download
1. Buka `https://al-musik.vercel.app/download`
2. Ikuti instruksi di halaman tersebut

---

## Metode 3: Generate APK (Advanced)

### Menggunakan PWABuilder
1. Buka https://www.pwabuilder.com/
2. Masukkan URL: `https://al-musik.vercel.app`
3. Klik **"Start"**
4. Pilih **"Android"** → **"Package for stores"**
5. Download file APK
6. Install APK di HP Android

### Menggunakan Bubblewrap (Developer)
```bash
# Install bubblewrap
npm install -g @anthropic/anthropic-bubblewrap

# Generate TWA
bubblewrap init --manifest https://al-musik.vercel.app/manifest.json

# Build APK
bubblewrap build
```

---

## Troubleshooting

### "Install app" tidak muncul?
- Pastikan menggunakan Chrome (Android) atau Safari (iOS)
- Pastikan sudah HTTPS
- Coba refresh halaman

### Aplikasi tidak bisa offline?
- Buka aplikasi sekali saat online
- Service worker akan cache halaman

### Icon tidak muncul?
- Tunggu beberapa detik setelah install
- Restart HP jika perlu

---

## Link Penting
- Web App: https://al-musik.vercel.app
- Mobile Version: https://al-musik.vercel.app/mobile
- Download Page: https://al-musik.vercel.app/download
