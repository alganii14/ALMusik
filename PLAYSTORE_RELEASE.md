# Panduan Rilis ALMusik ke Play Store

## Langkah 1: Persiapan PWA

Aplikasi sudah dikonfigurasi sebagai PWA (Progressive Web App) dengan:
- ✅ `manifest.json` - Konfigurasi app
- ✅ `sw.js` - Service Worker untuk offline support
- ✅ Mobile-optimized UI di `/mobile`

## Langkah 2: Deploy ke Server

Deploy aplikasi ke hosting (Vercel, Railway, dll):

```bash
# Build aplikasi
npm run build

# Deploy ke Vercel
npx vercel --prod
```

## Langkah 3: Generate APK dengan PWABuilder

1. Buka https://www.pwabuilder.com/
2. Masukkan URL aplikasi yang sudah di-deploy (contoh: `https://almusik.vercel.app/mobile`)
3. Klik "Start"
4. Pilih "Android" 
5. Download APK/AAB file

## Langkah 4: Buat Akun Google Play Console

1. Buka https://play.google.com/console
2. Bayar biaya pendaftaran $25 (sekali bayar)
3. Lengkapi informasi developer

## Langkah 5: Buat Aplikasi Baru

1. Klik "Create app"
2. Isi informasi:
   - **App name**: ALMusik
   - **Default language**: Indonesian
   - **App or game**: App
   - **Free or paid**: Free

## Langkah 6: Store Listing

Siapkan aset berikut:
- **App icon**: 512x512 PNG
- **Feature graphic**: 1024x500 PNG
- **Screenshots**: Minimal 2 screenshot (phone)
- **Short description**: "Dengarkan jutaan lagu gratis"
- **Full description**: Deskripsi lengkap aplikasi

## Langkah 7: Upload APK/AAB

1. Pergi ke "Release" > "Production"
2. Klik "Create new release"
3. Upload file AAB dari PWABuilder
4. Isi release notes

## Langkah 8: Content Rating

1. Pergi ke "Policy" > "App content"
2. Isi kuesioner content rating
3. Dapatkan rating (biasanya "Everyone")

## Langkah 9: Pricing & Distribution

1. Pilih negara distribusi
2. Konfirmasi app gratis

## Langkah 10: Submit untuk Review

1. Review semua informasi
2. Klik "Submit for review"
3. Tunggu 1-7 hari untuk approval

---

## Alternatif: TWA (Trusted Web Activity)

Untuk performa lebih baik, gunakan TWA:

```bash
# Install bubblewrap
npm install -g @anthropic/bubblewrap

# Init TWA project
bubblewrap init --manifest=https://your-app.vercel.app/manifest.json

# Build APK
bubblewrap build
```

## Catatan Penting

1. **Digital Asset Links**: Tambahkan file `/.well-known/assetlinks.json` di server
2. **HTTPS Required**: Pastikan app di-deploy dengan HTTPS
3. **Icons**: Generate semua ukuran icon yang diperlukan
4. **Privacy Policy**: Wajib punya halaman privacy policy

## Kontak Support

Jika ada masalah saat rilis, hubungi:
- Google Play Console Help: https://support.google.com/googleplay/android-developer
