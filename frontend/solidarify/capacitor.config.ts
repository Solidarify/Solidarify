import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter', 
  appName: 'Solidarify',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    allowNavigation: [
      '192.168.1.*',
      'tu-api-en-produccion.com'

    ],
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true, 
    },
  
  },
};

export default config;
