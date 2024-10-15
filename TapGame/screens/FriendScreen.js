// src/screens/FriendScreen.js

import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LeaderboardTabs from '../componentsRanking/LeaderboardTabs';

const Tab = createMaterialTopTabNavigator();

const FriendScreen = () => {
  return (
    <LeaderboardTabs />
  );
};

export default FriendScreen;
