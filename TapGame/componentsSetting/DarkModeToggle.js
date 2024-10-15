// componentsSetting/DarkModeToggle.js
import React, { useContext } from 'react';
import { Switch, View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from './ThemeContext';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dark Mode</Text>
      <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  label: {
    fontSize: 18,
  },
});

export default DarkModeToggle;
