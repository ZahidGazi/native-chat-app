import { Tabs } from 'expo-router';
import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Users",
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
