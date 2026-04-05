import 'dotenv/config';

export default {
  expo: {
    name: "frontmovil",
    slug: "frontmovil",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
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
        projectId: "0933227c-dbc3-4072-a39b-63cd6dd40e46"
      },
      EXPO_PUBLIC_URL_BACKEND: process.env.EXPO_PUBLIC_URL_BACKEND,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    }
  }
};
