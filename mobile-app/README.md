# ALMusik Mobile App

Aplikasi mobile ALMusik menggunakan Expo/React Native.

## Setup

1. Install dependencies:
```bash
cd mobile-app
npm install
```

2. Update API URL di `constants/api.ts`:
```typescript
export const API_BASE_URL = "https://your-website.vercel.app";
```

3. Jalankan development:
```bash
npm start
```

## Build APK

### Menggunakan EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login ke Expo:
```bash
eas login
```

3. Build APK:
```bash
eas build -p android --profile preview
```

### Build Lokal

1. Install Android Studio dan setup Android SDK

2. Generate native project:
```bash
npx expo prebuild
```

3. Build APK:
```bash
cd android
./gradlew assembleRelease
```

APK akan ada di `android/app/build/outputs/apk/release/`

## Struktur Project

```
mobile-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home
│   │   ├── search.tsx     # Search
│   │   └── library.tsx    # Library
│   ├── login.tsx          # Login page
│   ├── signup.tsx         # Signup page
│   └── settings.tsx       # Settings page
├── components/            # Reusable components
├── constants/             # Colors, API config
├── context/               # React Context (Auth, Player)
└── assets/               # Images, icons
```

## Assets yang Perlu Ditambahkan

Buat folder `assets/` dan tambahkan:
- `icon.png` (1024x1024) - App icon
- `splash.png` (1284x2778) - Splash screen
- `adaptive-icon.png` (1024x1024) - Android adaptive icon

## API Endpoints

Aplikasi ini menggunakan API dari website utama:
- `/api/music` - Daftar lagu
- `/api/youtube/info` - Search YouTube
- `/api/lyrics` - Lirik lagu
