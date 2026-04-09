import 'dotenv/config';

export default {
  expo: {
    name: "frontmovil",
    slug: "frontmovil",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.winterohh.frontmovil",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "6d745b22-c66a-4a64-8fc1-896de0355faa"
      },
      EXPO_PUBLIC_URL_BACKEND: process.env.EXPO_PUBLIC_URL_BACKEND,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    }
  }
};
