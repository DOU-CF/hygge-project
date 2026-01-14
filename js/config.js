// js/config.js - 集中管理配置
const AppConfig = {
  weather: {
    // ✅ 先用假的 URL，等 Zeabur 部署好再改
    apiUrl: "https://YOUR-ZEABUR-URL.zeabur.app/api/weather",
    defaultCity: "Taoyuan",
    // ✅ 完全移除 apiKey
  },
};

// 設為全域變數
window.AppConfig = AppConfig;
