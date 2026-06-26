import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swasthanand.app',
  appName: 'Swasthanand',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  },
  server: {
    // Allow cleartext HTTP for local development (your PC's WiFi IP)
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;
