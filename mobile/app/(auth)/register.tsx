import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, useColorScheme } from "react-native";
import { registerUser } from "../../utils/api";
import { useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const colorScheme = useColorScheme();

  const handleRegister = async () => {
    try {
      await registerUser({ name, email, password });
      router.replace("/(auth)/login");
    } catch (err) {
      setError("Registration failed");
    }
  };

  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Register</Text>
      <TextInput 
        placeholder="Name" 
        value={name} 
        onChangeText={setName} 
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
      <Button title="Register" onPress={handleRegister} />
      <Text 
        onPress={() => router.push("/(auth)/login")} 
        style={[styles.link, { color: isDark ? '#0a84ff' : '#007AFF' }]}
      >
        Already have an account? Login
      </Text>
    </View>
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
