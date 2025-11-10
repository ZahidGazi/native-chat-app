import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { registerUser } from "../../utils/api";
import { useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      await registerUser({ name, email, password });
      router.replace("/(auth)/login");
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Register" onPress={handleRegister} />
      <Text onPress={() => router.push("/(auth)/login")} style={styles.link}>Already have an account? Login</Text>
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
