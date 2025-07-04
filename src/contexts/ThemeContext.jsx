import React, { createContext, useContext, useState, useEffect } from "react";
import { themes } from "../utils/themes"; // Import themes from utils

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("dark"); // Default to dark

  useEffect(() => {
    const savedTheme = localStorage.getItem("appTheme");
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    } else {
      setCurrentTheme("dark"); // Fallback to dark if no valid theme is saved
    }
  }, []);

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem("appTheme", themeName);
    }
  };

  const themeClasses = themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ themeClasses, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
