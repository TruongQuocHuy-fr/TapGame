// src/services/LeaderboardService.js

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

class LeaderboardService {
  async syncUserToLeaderboard(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();

        // Update leaderboard based on total coins
        await setDoc(doc(db, 'leaderboardByCoins', uid), {
          characterName: userData.characterName,
          totalCoins: userData.totalCoins,
          avatar: userData.avatar,
          isElite: userData.totalCoins >= 100000,  // Example: elite when total coins exceed 100,000
        });

        // Update leaderboard based on total mined coins for level progression
        await setDoc(doc(db, 'leaderboardByLevel', uid), {
          characterName: userData.characterName,
          level: userData.level,  // Use total mined coins for level
          avatar: userData.avatar,
          isElite: userData.totalMinedCoins >= 50000,  // Example: elite when mined coins exceed 50,000
        });

        //console.log("Leaderboard synced for user:", uid);
      } else {
        console.log("User does not exist in Firestore.");
      }
    } catch (error) {
      console.error("Error syncing leaderboard for user:", error);
    }
  }
}

export default new LeaderboardService();
