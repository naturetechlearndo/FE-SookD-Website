declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      target: string | Date,
      params?: Record<string, any>
    ) => void;
  }
}

export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', eventName, params);
};