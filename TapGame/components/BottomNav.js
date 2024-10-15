import React, { useEffect, useRef, useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../componentsSetting/ThemeContext'; // Import ThemeContext

const BottomNav = ({ state, descriptors, navigation }) => {
  const homeIconSize = useRef(new Animated.Value(1)).current;
  const friendIconSize = useRef(new Animated.Value(1)).current;
  const missionIconSize = useRef(new Animated.Value(1)).current;
  const mineIconSize = useRef(new Animated.Value(1)).current;

  // Use ThemeContext to get the current theme
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    animateIconSize(state.index);
  }, [state.index]);

  // Animate icon sizes based on the active tab index
  const animateIconSize = (tabIndex) => {
    const resetScale = 1;
    const enlargedScale = 1.5;

    Animated.timing(homeIconSize, {
      toValue: tabIndex === 0 ? enlargedScale : resetScale,
      duration: 200,
      useNativeDriver: false,
    }).start();

    Animated.timing(friendIconSize, {
      toValue: tabIndex === 1 ? enlargedScale : resetScale,
      duration: 200,
      useNativeDriver: false,
    }).start();

    Animated.timing(missionIconSize, {
      toValue: tabIndex === 2 ? enlargedScale : resetScale,
      duration: 200,
      useNativeDriver: false,
    }).start();

    Animated.timing(mineIconSize, {
      toValue: tabIndex === 3 ? enlargedScale : resetScale,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Function to get the icon color
  const getIconColor = (tabIndex, currentIndex) => {
    return tabIndex === currentIndex ? '#ffffff' : (isDarkMode ? '#BBBBBB' : '#4CAF50');
  };

  // Function to get the text color
  const getTextColor = (tabIndex, currentIndex) => {
    return tabIndex === currentIndex ? '#ffffff' : (isDarkMode ? '#BBBBBB' : '#4CAF50');
  };

  // Function to get the background color for the selected tab
  const getBackgroundColor = (tabIndex, currentIndex) => {
    return tabIndex === currentIndex ? (isDarkMode ? '#555555' : '#4CAF50') : (isDarkMode ? '#333333' : '#ffffff');
  };

  return (
    <View style={[styles.navContainer, { backgroundColor: isDarkMode ? '#333' : '#ffffff' }]}>
      <TouchableOpacity
        style={[styles.navItem, { backgroundColor: getBackgroundColor(0, state.index) }]}
        onPress={() => navigation.navigate('Home')}
      >
        <Animated.View style={{ transform: [{ scale: homeIconSize }] }}>
          <Ionicons name="home-outline" size={24} color={getIconColor(0, state.index)} />
        </Animated.View>
        <Text style={[styles.navText, { color: getTextColor(0, state.index) }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, { backgroundColor: getBackgroundColor(1, state.index) }]}
        onPress={() => navigation.navigate('Friend')}
      >
        <Animated.View style={{ transform: [{ scale: friendIconSize }] }}>
          <Ionicons name="trophy-outline" size={24} color={getIconColor(1, state.index)} />
        </Animated.View>
        <Text style={[styles.navText, { color: getTextColor(1, state.index) }]}>Rank</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, { backgroundColor: getBackgroundColor(2, state.index) }]}
        onPress={() => navigation.navigate('Mission')}
      >
        <Animated.View style={{ transform: [{ scale: missionIconSize }] }}>
          <Ionicons name="list-outline" size={24} color={getIconColor(2, state.index)} />
        </Animated.View>
        <Text style={[styles.navText, { color: getTextColor(2, state.index) }]}>Mission</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, { backgroundColor: getBackgroundColor(3, state.index) }]}
        onPress={() => navigation.navigate('Mine')}
      >
        <Animated.View style={{ transform: [{ scale: mineIconSize }] }}>
          <Ionicons name="settings-outline" size={24} color={getIconColor(3, state.index)} />
        </Animated.View>
        <Text style={[styles.navText, { color: getTextColor(3, state.index) }]}>Setting</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 5,
  },
  navText: {
    fontSize: 8,
    marginTop: 4,
    fontWeight: 'bold',
  },
});

export default BottomNav;
