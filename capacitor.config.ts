import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mohamed.skillsgame',
  appName: 'Skills Game',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
