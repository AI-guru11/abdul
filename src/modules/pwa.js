export function registerServiceWorker() {
  if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('./service-worker.js')
      .catch(e => console.error('SW failed', e));
}
