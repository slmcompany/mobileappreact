import { StyleSheet, Platform } from 'react-native';

export const globalStyles = StyleSheet.create({
  text: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
}); 