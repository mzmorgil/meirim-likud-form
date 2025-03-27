
// Utility to ensure jsrsasign library is loaded
export const ensureJsrsasignLoaded = (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    // Check if already loaded
    if (window.KJUR) {
      resolve();
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://kjur.github.io/jsrsasign/jsrsasign-all-min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load jsrsasign library'));
    document.head.appendChild(script);
  });
};
