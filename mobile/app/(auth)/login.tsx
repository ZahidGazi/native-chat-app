import React, { useState } from "react";
import { TextInput, Button, Text, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginUser } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const colorScheme = useColorScheme();

  const handleLogin = async () => {
    try {
      const res = await loginUser({ email, password });
      await AsyncStorage.setItem("token", res.data.token);
      router.replace("/(tabs)");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]} edges={['top', 'bottom']}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Login</Text>
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        style={[
          styles.input,
          { 
            backgroundColor: isDark ? '#1c1c1e' : '#fff',
            color: isDark ? '#fff' : '#000',
            borderColor: isDark ? '#3a3a3c' : '#ddd'
          }
        ]}
        placeholderTextColor={isDark ? '#8e8e93' : '#999'}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        style={[
          styles.input,
          { 
            backgroundColor: isDark ? '#1c1c1e' : '#fff',
            color: isDark ? '#fff' : '#000',
            borderColor: isDark ? '#3a3a3c' : '#ddd'
          }
        ]}
        placeholderTextColor={isDark ? '#8e8e93' : '#999'}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
      <Text 
        onPress={() => router.push("/(auth)/register")} 
        style={[styles.link, { color: isDark ? '#0a84ff' : '#007AFF' }]}
      >
        No account? Register
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20,
  },
  title: { 
    fontSize: 28, 
    textAlign: "center", 
    marginBottom: 30,
    fontWeight: "bold"
  },
  input: { 
    borderWidth: 1, 
    padding: 12, 
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  error: { 
    color: "#ff3b30", 
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
  },
  link: { 
    textAlign: "center", 
    marginTop: 16,
    fontSize: 16,
  },
});
