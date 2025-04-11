import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function GalleryLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#27273E',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
            color: '#FFFFFF',
            fontFamily: 'Roboto Flex',
          },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerTintColor: '#7B7D9D',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Thư viện nội dung',
          }}
        />
        <Stack.Screen
          name="post_brand"
          options={{
            title: 'Thương hiệu',
          }}
        />
        <Stack.Screen
          name="post-detail"
          options={{
            title: 'Chi tiết bài viết',
          }}
        />
      </Stack>
    </>
  );
} 