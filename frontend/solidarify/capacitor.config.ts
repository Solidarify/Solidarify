import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter', // Tu ID de paquete
  appName: 'Solidarify',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      '192.168.1.*',
      'tu-api-en-produccion.com' 
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true, 
    },
  },
};

export default config;
