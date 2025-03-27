import { Redirect } from 'expo-router';

export default function Index() {
  // Chuyển hướng người dùng đến trang đăng nhập
  return <Redirect href="/(auth)/login" />;
} 