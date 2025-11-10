import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { loginUser } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await loginUser({ email, password });
      await AsyncStorage.setItem("token", res.data.token);
      router.replace("/(tabs)");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
      <Text onPress={() => router.push("/(auth)/register")} style={styles.link}>No account? Register</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  error: { color: "red", textAlign: "center" },
  link: { color: "blue", textAlign: "center", marginTop: 10 },
});
