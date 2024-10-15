import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
import LeaderboardItem from './LeaderboardItem'; 
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../ConnectFirebase/firebaseConfig'; 

const LeaderboardByCoins = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchLeaderboardData = (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);

      const leaderboardRef = collection(db, 'leaderboardByCoins');
      const q = query(leaderboardRef, orderBy('totalCoins', 'desc'), limit(100));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const leaderboard = [];
        querySnapshot.forEach((doc) => {
          leaderboard.push({
            id: doc.id,
            characterName: doc.data().characterName,
            score: doc.data().totalCoins,
            avatar: doc.data().avatar,
            isElite: doc.data().isElite,
          });
        });

        setLeaderboardData(leaderboard);
        setLoading(false);
        setRefreshing(false);
        setIsEmpty(leaderboard.length === 0);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching leaderboard data: ', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = fetchLeaderboardData();
    return () => unsubscribe && unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboardData(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading leaderboard...</Text>
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
            score={item.score}
            avatar={item.avatar}
            isElite={item.isElite}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false} // Ẩn thanh cuộn dọc
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

export default LeaderboardByCoins;
