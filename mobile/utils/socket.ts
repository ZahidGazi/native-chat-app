import io, { Socket } from "socket.io-client";
import { API_URL } from "../constants/config";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitUserOnline = (userId: string) => {
  const socketInstance = getSocket();
  socketInstance.emit("user:online", userId);
};

export const listenForPresenceUpdates = (callback: (data: { userId: string; online: boolean }) => void) => {
  const socketInstance = getSocket();
  socketInstance.on("presence:update", callback);
  return () => {
    socketInstance.off("presence:update", callback);
  };
};
