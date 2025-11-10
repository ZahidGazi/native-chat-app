import { Platform } from "react-native";

// Production API URL
const PRODUCTION_URL = "https://chat-app.zahid.cat";

// Development URLs
const DEV_WEB_URL = "http://localhost:4000";
const DEV_MOBILE_URL = "http://192.168.1.36:4000";

// Use production URL or development URL based on environment
export const API_URL = __DEV__
  ? Platform.OS === "web"
    ? DEV_WEB_URL
    : DEV_MOBILE_URL
  : PRODUCTION_URL;

export const SOCKET_URL = API_URL;
