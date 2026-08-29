import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

declare const __APP_BUILD_TIME__: string;

// ── 1. Tự động xử lý khi Vercel deploy bản mới (Chunk Loading Error Auto-Reload) ──
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[CacheBuster] Phát hiện phiên bản mã nguồn mới, đang tự động nạp lại...');
    event.preventDefault();
    window.location.reload();
  });

  // ── 2. Tự động dọn dẹp cache cũ khi có bản build mới ──
  try {
    const currentBuild = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : 'dev';
    const lastBuild = localStorage.getItem('hl_app_build_version');
    if (lastBuild && lastBuild !== currentBuild) {
      console.log(`[CacheBuster] Nâng cấp ứng dụng: ${lastBuild} -> ${currentBuild}`);
      // Dọn dẹp cache truy vấn và dữ liệu tạm (giữ lại session đăng nhập)
      const keysToKeep = new Set(['hl_auth_user', 'hl_active_family_id', 'hl_platform_role', 'hl_clan_pass_session']);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('hl_') && !keysToKeep.has(key)) {
          localStorage.removeItem(key);
        }
      }
      sessionStorage.clear();
    }
    localStorage.setItem('hl_app_build_version', currentBuild);
  } catch (e) {
    // ignore
  }

  // ── 3. Cung cấp hàm toàn cục cho người dùng xóa cache 1 chạm ──
  (window as any).clearAppCacheAndReload = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      sessionStorage.clear();
      localStorage.removeItem('hl_families');
      localStorage.removeItem('hl_memberships');
      localStorage.removeItem('hl_app_build_version');
      localStorage.removeItem('hl_last_chunk_reload');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
