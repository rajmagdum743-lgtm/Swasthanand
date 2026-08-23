/**
 * Utility to load the Razorpay Checkout SDK dynamically.
 * Checks if window.Razorpay is already present, prevents duplicate script tags,
 * and handles load/error states gracefully.
 */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

let sdkPromise: Promise<boolean> | null = null;

export const loadRazorpaySDK = (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  // SDK already loaded
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  // Return ongoing script loading promise if already in flight
  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => {
        sdkPromise = null;
        resolve(false);
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      sdkPromise = null;
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return sdkPromise;
};
