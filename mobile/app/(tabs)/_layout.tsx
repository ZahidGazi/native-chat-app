import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Users",
          headerShown: false,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2" color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: "Profile",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle" color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="chat" 
        options={{ 
          href: null,
        }} 
      />
    </Tabs>
  );
}
