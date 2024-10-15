import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LeaderboardByCoins from './LeaderboardByCoins';
import LeaderboardByLevel from './LeaderboardByLevel';
import { StyleSheet, View } from 'react-native';

const Tab = createMaterialTopTabNavigator();

const LeaderboardTabs = () => {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#ffffff',
            tabBarInactiveTintColor: '#b0bec5',
            tabBarLabelStyle: { 
              fontSize: 14, 
              fontWeight: 'bold', 
              fontFamily: 'sans-serif-medium' 
            },
            tabBarStyle: { 
              backgroundColor: '#6200ee',
              elevation: 4, 
              borderRadius: 10, 
              marginBottom: 10, 
            },
            tabBarIndicatorStyle: { 
              backgroundColor: '#ffffff',
              height: 4,
              borderRadius: 2, 
            },
            tabBarItemStyle: {
              marginHorizontal: 10,
            },
          }}
        >
          <Tab.Screen name="Coins" component={LeaderboardByCoins} />
          <Tab.Screen name="Level" component={LeaderboardByLevel} />
        </Tab.Navigator>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80, // Adjust this value based on the height of your BottomNav
  },
});

export default LeaderboardTabs;
