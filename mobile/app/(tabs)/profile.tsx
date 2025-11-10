import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/utils/api';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      // Decode JWT to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);

      // Fetch user details
      const response = await api.get(`/users/${payload.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setName(response.data.name);
      setEmail(response.data.email);
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
      if (Platform.OS === 'web') {
        window.alert('Failed to load profile');
      } else {
        Alert.alert('Error', 'Failed to load profile');
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Name cannot be empty');
      } else {
        Alert.alert('Error', 'Name cannot be empty');
      }
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await api.put(
        `/users/${userId}`,
        { name: name.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (Platform.OS === 'web') {
        window.alert('Profile updated successfully');
      } else {
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to update profile');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    // Use native confirm for web, Alert for native platforms
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        await AsyncStorage.removeItem('token');
        router.replace('/(auth)/login');
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.removeItem('token');
              router.replace('/(auth)/login');
            }
          }
        ]
      );
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol 
          name="person.circle.fill" 
          size={80} 
          color={Colors[colorScheme ?? 'light'].tint} 
        />
        <ThemedText type="title" style={styles.headerTitle}>Profile</ThemedText>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Name</ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                color: colorScheme === 'dark' ? '#fff' : '#000',
                backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                borderColor: colorScheme === 'dark' ? '#555' : '#ddd'
              }
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Email</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.disabledInput,
              { 
                color: colorScheme === 'dark' ? '#888' : '#666',
                backgroundColor: colorScheme === 'dark' ? '#222' : '#e5e5e5',
                borderColor: colorScheme === 'dark' ? '#444' : '#ccc'
              }
            ]}
            value={email}
            editable={false}
            placeholder="Email"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
          />
          <ThemedText style={styles.helperText}>Email cannot be changed</ThemedText>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            styles.saveButton,
            saving && styles.buttonDisabled
          ]}
          onPress={handleUpdateProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  headerTitle: {
    marginTop: 16,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  disabledInput: {
    opacity: 0.6,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 50,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 16,
  },
});
