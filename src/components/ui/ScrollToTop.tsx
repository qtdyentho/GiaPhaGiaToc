import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Tự động cuộn lên đầu trang mỗi khi chuyển route trong ứng dụng SPA
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Cuộn window
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    // 2. Cuộn thẻ main container nếu có
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
