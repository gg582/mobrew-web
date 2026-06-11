import { useSyncExternalStore } from 'react';

function getIsMobile(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/.test(ua);

  // 종횡비 기반 판단 (픽셀 절대값 사용 안 함)
  // 세로가 가로보다 5:4 이상 긴 화면을 모바일/세로 모드로 간주
  const ratio = window.screen.height / window.screen.width;
  const isNarrowAspect = ratio > 1.25;

  return isMobileUA || isNarrowAspect;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('resize', callback);
  window.addEventListener('orientationchange', callback);
  return () => {
    window.removeEventListener('resize', callback);
    window.removeEventListener('orientationchange', callback);
  };
}

export function useMobileMode(): boolean {
  return useSyncExternalStore(
    subscribe,
    getIsMobile,
    () => false // server snapshot
  );
}
