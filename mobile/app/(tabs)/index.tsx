import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUsers } from "../../utils/api";
import { useRouter } from "expo-router";

export default function UserList() {
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem("token");
      const res = await getUsers(token!);
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{ padding: 20, borderBottomWidth: 1 }}
          onPress={() => router.push(`/chat/${item._id}`)}
        >
          <Text>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
