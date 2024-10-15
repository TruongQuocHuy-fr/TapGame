import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { EnergyProvider } from './components/EnergyContext';
import HomeScreen from './screens/HomeScreen';
import FriendScreen from './screens/FriendScreen';
import MissionScreen from './screens/MissionScreen';
import MineScreen from './screens/MineScreen';
import BoostScreen from './components/BoostScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import BottomNav from './components/BottomNav'; 
import Toast from 'react-native-toast-message';
import { ThemeProvider } from './componentsSetting/ThemeContext'; // Import ThemeProvider

// Import the Login and Register screens
import LoginScreen from './componentsAuth/LoginScreen';
import RegisterScreen from './componentsAuth/RegisterScreen';
import AirdropScreen from './screens/AirdropScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="Home"
    tabBar={(props) => <BottomNav {...props} />} 
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = 'home-outline';
        } else if (route.name === 'Friend') {
          iconName = 'people-outline';
        } else if (route.name === 'Mission') {
          iconName = 'list-outline';
        } else if (route.name === 'Mine') {
          iconName = 'person-circle-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Friend" component={FriendScreen} />
    <Tab.Screen name="Mission" component={MissionScreen} />
    <Tab.Screen name="Mine" component={MineScreen} />
  </Tab.Navigator>
);

const App = () => {
  return (
    <EnergyProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            {/* Authentication Stack */}
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ headerShown: false }} 
            />
            
            {/* Main Application Stack */}
            <Stack.Screen 
              name="Main" 
              component={MainTabs} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="BoostScreen" 
              component={BoostScreen} 
              options={{ title: 'Boost' }} 
            />
            <Stack.Screen 
              name="EditProfileScreen" 
              component={EditProfileScreen} 
              options={{ title: 'Edit Profile' }} 
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen} 
              options={{ title: 'Forgot Password' }} 
            />
            <Stack.Screen
              name='AirdropScreen'
              component={AirdropScreen}
              options={{title: 'Wallet'}}
            />
          </Stack.Navigator>
        </NavigationContainer>
        {/* <Toast /> */}
      </ThemeProvider>
    </EnergyProvider>
  );
};

export default App;
