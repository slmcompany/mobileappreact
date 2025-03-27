export const colors = {
  // Primary colors
  primary: '#00A650',
  secondary: '#0066CC',
  
  // System colors
  systemRed: '#FF3B30',
  systemGreen: '#00A650',
  systemBlue: '#0066CC',
  
  // Text colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textLight: '#888888',
  
  // Background colors
  background: '#FFFFFF',
  backgroundLight: '#F5F5F8',
  backgroundGray: '#F8F9FA',
  
  // Border colors
  border: '#EEEEEE',
  borderLight: '#F0F0F0',
  borderDark: '#DDDDDD',
  
  // Status colors
  success: '#00A650',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#0066CC',
  
  // Common colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Định nghĩa type để TypeScript có thể kiểm tra type
export type ColorKeys = keyof typeof colors; 