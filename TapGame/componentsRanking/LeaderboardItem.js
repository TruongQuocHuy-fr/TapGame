import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LeaderboardItem = ({ rank, characterName, score, avatar, isElite }) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.rankContainer}>
        <Icon name="emoji-events" size={24} color={rank === 1 ? 'gold' : 'silver'} />
        <Text style={styles.rank}>{rank}</Text>
      </View>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.characterName}>{characterName}</Text>
        <View style={styles.coinContainer}>
          <Icon name="monetization-on" size={16} color="gold" />
          <Text style={styles.score}>{score}</Text>
        </View>
      </View>
      {isElite && <Text style={styles.elite}>Elite</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 15,
    marginVertical: 7,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000', 
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60, 
  },
  rank: {
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 5,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  characterName: {
    fontSize: 18,
    fontWeight: '600',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  score: {
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 16,
  },
  elite: {
    color: 'gold',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default LeaderboardItem;
