import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import LeaderboardItem from './LeaderboardItem';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../ConnectFirebase/firebaseConfig';

const LeaderboardByLevel = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchLeaderboardData = () => {
    try {
      const leaderboardRef = collection(db, 'leaderboardByLevel');
      const q = query(leaderboardRef, orderBy('level', 'desc'), limit(100)); // Change 'currentLevel' to 'level'

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const leaderboard = [];
        querySnapshot.forEach((doc) => {
          leaderboard.push({
            id: doc.id,
            characterName: doc.data().characterName,
            level: doc.data().level, // Accessing level field
            avatar: doc.data().avatar,
            isElite: doc.data().isElite,
          });
        });

        setLeaderboardData(leaderboard);
        setLoading(false);
        setIsEmpty(leaderboard.length === 0);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching leaderboard data: ', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = fetchLeaderboardData();
    return () => unsubscribe && unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No leaderboard data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leaderboardData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <LeaderboardItem
            rank={index + 1}
            characterName={item.characterName}
            score={item.level} // Ensure this corresponds to the data
            avatar={item.avatar}
            isElite={item.isElite}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LeaderboardByLevel;
