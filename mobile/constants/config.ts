import { Platform } from "react-native";

// for web use localhost, for mobile use your PC's IP
export const API_URL = Platform.OS === "web" 
  ? "http://localhost:5000" 
  : "http://192.168.1.36:5000";

export const SOCKET_URL = API_URL;
