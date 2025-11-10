import { IconSymbol } from "@/components/ui/icon-symbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUsers } from "../../utils/api";
import { emitUserOnline, listenForPresenceUpdates } from "../../utils/socket";

interface User {
  _id: string;
  name: string;
  email: string;
  online?: boolean;
}

export default function UserList() {
  const router = useRouter();
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const colorScheme = useColorScheme();

  const fetchUsers = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, [fetchUsers]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={onRefresh}
          disabled={refreshing}
          style={{ marginRight: 15 }}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#fff' : '#007AFF'} />
          ) : (
            <IconSymbol
              name="arrow.clockwise"
              size={22}
              color={colorScheme === 'dark' ? '#fff' : '#007AFF'}
            />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, onRefresh, refreshing, colorScheme]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }} edges={['top']}>
      <View style={[
        styles.headerContainer,
        { 
          backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff',
          borderBottomColor: colorScheme === 'dark' ? '#2c2c2e' : '#e0e0e0'
        }
      ]}>
        <Text style={[
          styles.headerTitle,
          { color: colorScheme === 'dark' ? '#fff' : '#000' }
        ]}>
          Users
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          disabled={refreshing}
          style={styles.refreshButton}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.refreshIcon}>↻</Text>
          )}
        </TouchableOpacity>
      </View>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colorScheme === 'dark' ? '#fff' : '#000'}
            colors={['#007AFF']}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  refreshButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
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
