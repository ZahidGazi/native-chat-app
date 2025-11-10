import axios from "axios";
import { API_URL } from "../constants/config";

export const api = axios.create({
    baseURL: API_URL,
});

export const registerUser = async (data: { name: string; email: string; password: string }) => {
    return api.post("/auth/register", data);
};

export const loginUser = async (data: { email: string; password: string }) => {
    return api.post("/auth/login", data);
};

export const getUsers = async (token: string) => {
    return api.get("/users", { headers: { Authorization: `Bearer ${token}` } });
};

export const getMessages = async (token: string, conversationId: string) => {
    return api.get(`/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
