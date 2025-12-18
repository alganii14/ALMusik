// Ganti dengan URL API website kamu
export const API_BASE_URL = "https://al-musik.vercel.app";

// Atau untuk development lokal
// export const API_BASE_URL = "http://192.168.1.x:3000";

export const API_ENDPOINTS = {
  music: `${API_BASE_URL}/api/music`,
  youtube: {
    info: `${API_BASE_URL}/api/youtube/info`,
    download: `${API_BASE_URL}/api/youtube/download`,
  },
  lyrics: `${API_BASE_URL}/api/lyrics`,
  playlist: `${API_BASE_URL}/api/playlist`,
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    signup: `${API_BASE_URL}/api/auth/signup`,
    sendCode: `${API_BASE_URL}/api/auth/send-code`,
    verifyCode: `${API_BASE_URL}/api/auth/verify-code`,
  },
};

// Google OAuth Config
export const GOOGLE_WEB_CLIENT_ID = "280831770264-sva0kdav2mten3u2hhinvvr2h4l51hjc.apps.googleusercontent.com"; // Ganti dengan client ID dari Google Cloud Console
