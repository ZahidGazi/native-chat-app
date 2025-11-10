import React, { useEffect, useState, useCallback, useRef } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, Stack } from "expo-router";
import { api, getMessages } from "../../utils/api";
import { View, ActivityIndicator, Text } from "react-native";
import { getSocket, emitUserOnline } from "../../utils/socket";

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // other user's id
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [userId, setUserId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserName, setOtherUserName] = useState("Chat");
  const typingTimeoutRef = useRef<any>(null);
  const inputTextRef = useRef("");

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        // Decode JWT to get user ID
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentUserId = payload.id;
        setUserId(currentUserId);

        // Create or get conversation
        const convRes = await api.post(
          "/conversations/between",
          { userId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const convId = convRes.data._id;
        setConversationId(convId);

        // Load existing messages
        const messagesRes = await getMessages(token, convId);
        const formattedMessages = messagesRes.data.map((msg: any) => ({
          _id: msg._id,
          text: msg.text,
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.sender._id,
            name: msg.sender.name,
          },
          sent: true,
          received: msg.readBy && msg.readBy.length > 1,
          pending: false,
        })).reverse();
        setMessages(formattedMessages);

        // Get the other user's name from messages or fetch it
        let userName = "Chat";
        if (messagesRes.data.length > 0) {
          const otherUserMsg = messagesRes.data.find((msg: any) => msg.sender._id === id);
          if (otherUserMsg) {
            userName = otherUserMsg.sender.name;
          }
        }
        
        // If no messages yet or name not found, fetch the user's name
        if (userName === "Chat") {
          try {
            const userRes = await api.get(`/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            userName = userRes.data.name;
          } catch (err) {
            console.log("Error fetching user name:", err);
          }
        }
        
        setOtherUserName(userName);

        // Get socket instance and emit user online
        const socket = getSocket();
        emitUserOnline(currentUserId);

        // Mark all unread messages from the other user as read
        messagesRes.data.forEach((msg: any) => {
          if (msg.sender._id !== currentUserId && (!msg.readBy || !msg.readBy.includes(currentUserId))) {
            socket.emit("message:read", { messageId: msg._id, userId: currentUserId });
          }
        });

        // Listen for new messages
        socket.on("message:new", (msg: any) => {
          const formattedMsg: IMessage = {
            _id: msg._id,
            text: msg.text,
            createdAt: new Date(msg.createdAt),
            user: {
              _id: msg.sender._id,
              name: msg.sender.name,
            },
            sent: true,
            received: msg.readBy && msg.readBy.length > 1,
            pending: false,
          };
          setMessages((prev) => GiftedChat.append(prev, [formattedMsg]));

          // Mark message as read if it's from the other user
          if (msg.sender._id !== currentUserId) {
            socket.emit("message:read", { messageId: msg._id, userId: currentUserId });
          }
        });

        // Listen for typing events
        socket.on("typing:start", ({ conversationId: convId, userId: typingUserId }: any) => {
          if (convId === convId && typingUserId === id) {
            setIsTyping(true);
          }
        });

        socket.on("typing:stop", ({ conversationId: convId, userId: typingUserId }: any) => {
          if (convId === convId && typingUserId === id) {
            setIsTyping(false);
          }
        });

        // Listen for read receipts
        socket.on("message:read", ({ messageId, userId: readerId }: any) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId ? { ...msg, received: true } : msg
            )
          );
        });

        setLoading(false);
      } catch (error) {
        console.error("Init error:", error);
        setLoading(false);
      }
    };

    init();

    return () => {
      const socket = getSocket();
      socket.off("message:new");
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("message:read");
    };
  }, [id]);

  const handleInputTextChanged = useCallback((newText: string) => {
    inputTextRef.current = newText;

    if (!conversationId || !userId) return;

    const socket = getSocket();

    // Emit typing start
    if (newText.length > 0) {
      socket.emit("typing:start", { conversationId, userId });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to emit typing stop after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing:stop", { conversationId, userId });
      }, 2000);
    } else {
      socket.emit("typing:stop", { conversationId, userId });
    }
  }, [conversationId, userId]);

  const onSend = useCallback((msgs: IMessage[] = []) => {
    if (!conversationId || !userId) return;

    const socket = getSocket();
    const message = msgs[0];
    const payload = {
      conversationId,
      senderId: userId,
      text: message.text,
    };

    // Emit to socket - the message will be added via the message:new listener
    socket.emit("message:send", payload);

    // Stop typing indicator when message is sent
    socket.emit("typing:stop", { conversationId, userId });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    inputTextRef.current = "";
  }, [conversationId, userId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderMessageText = (props: any) => {
    const { currentMessage } = props;
    const isMyMessage = currentMessage.user._id === userId;

    return (
      <View>
        <Text style={{
          color: isMyMessage ? '#fff' : '#000',
          padding: 10,
          fontSize: 16
        }}>
          {currentMessage.text}
        </Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: otherUserName }} />
      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={{ _id: userId }}
        onInputTextChanged={handleInputTextChanged}
        isTyping={isTyping}
        renderMessageText={renderMessageText}
        renderFooter={() =>
          isTyping ? (
            <View style={{ padding: 10 }}>
              <Text style={{ color: '#888', fontSize: 12 }}>Typing...</Text>
            </View>
          ) : null
        }
        textInputProps={{
          multiline: true,
          // style: { maxHeight: 100 },
        }}
      // minInputToolbarHeight={44}
      />
    </>
  );
}
