import React, { createContext, useContext } from 'react';
import { StyleSheet } from 'react-native';

interface ThemeContextType {
  styles: {
    text: {
      fontFamily: string;
    };
  };
}

const defaultTheme: ThemeContextType = {
  styles: {
    text: {
      fontFamily: 'RobotoFlex',
    },
  },
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Global styles that can be used across the app
export const globalStyles = StyleSheet.create({
  text: {
    fontFamily: 'RobotoFlex',
  },
}); 