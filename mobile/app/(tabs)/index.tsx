import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUsers } from "../../utils/api";
import { useRouter } from "expo-router";
import { getSocket, emitUserOnline, listenForPresenceUpdates } from "../../utils/socket";

interface User {
  _id: string;
  name: string;
  email: string;
  online?: boolean;
}

export default function UserList() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        
        // Decode JWT to get current user ID
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;
        setCurrentUserId(userId);
        
        // Fetch users
        const res = await getUsers(token);
        setUsers(res.data);
        
        // Connect to socket and emit user online
        emitUserOnline(userId);
      } catch (error) {
        console.log("fetch users error:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    // Listen for presence updates
    const unsubscribe = listenForPresenceUpdates((data: { userId: string; online: boolean }) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === data.userId ? { ...user, online: data.online } : user
        )
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.userItem,
              { 
                backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff',
                borderBottomColor: colorScheme === 'dark' ? '#2c2c2e' : '#e0e0e0'
              }
            ]}
            onPress={() => router.push(`/chat/${item._id}?name=${encodeURIComponent(item.name)}`)}
          >
            <View style={styles.userInfo}>
              <Text style={[
                styles.userName,
                { color: colorScheme === 'dark' ? '#fff' : '#000' }
              ]}>
                {item.name}
              </Text>
              <Text style={[
                styles.userEmail,
                { color: colorScheme === 'dark' ? '#8e8e93' : '#666' }
              ]}>
                {item.email}
              </Text>
            </View>
            {item.online && (
              <View style={styles.onlineIndicator} />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#34C759",
    marginLeft: 12,
  },
});
