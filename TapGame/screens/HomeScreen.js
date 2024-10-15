import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import UserInfo from '../components/UserInfo';
import CoinDisplay from '../components/CoinDisplay';
import EggDisplay from '../components/EggDisplay';

const HomeScreen = () => {
  // Local fallback image
  const fallbackImage = require('../assets/fallback-image.png'); // Local fallback image

  return (
    <ImageBackground
      source={fallbackImage} // Use the fallback image directly
      style={styles.container}
    >
      <UserInfo />
      <CoinDisplay />
      <EggDisplay />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
