import { Platform } from "react-native";

// Production API URL
const PRODUCTION_URL = "https://chat-app.zahid.cat";

// Development URLs
const DEV_WEB_URL = "https://chat-app.zahid.cat";
const DEV_MOBILE_URL = "https://chat-app.zahid.cat";

// Use production URL or development URL based on environment
export const API_URL = __DEV__
  ? Platform.OS === "web"
    ? DEV_WEB_URL
    : DEV_MOBILE_URL
  : PRODUCTION_URL;

export const SOCKET_URL = API_URL;
