import { Redirect } from 'expo-router';

export default function Index() {
  // Chuyển hướng người dùng đến trang login khi mở ứng dụng
  return <Redirect href="/login" />;
} 