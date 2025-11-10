import React, { useEffect, useState, useCallback } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { API_URL } from "../../../constants/config";

const socket = io(API_URL);

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("token");
      // decode user id from token if you store it
      setUserId("YOUR_USER_ID");
    };
    init();
  }, []);

  useEffect(() => {
    socket.on("message:new", (msg) => {
      setMessages((prev) => GiftedChat.append(prev, msg));
    });
    return () => socket.off("message:new");
  }, []);

  const onSend = useCallback((msgs = []) => {
    socket.emit("message:send", msgs[0]);
    setMessages((prev) => GiftedChat.append(prev, msgs));
  }, []);

  return <GiftedChat messages={messages} onSend={(msgs) => onSend(msgs)} user={{ _id: userId }} />;
}
