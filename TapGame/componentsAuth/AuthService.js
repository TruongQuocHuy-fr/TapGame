import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, getDocs, getDoc, query, where } from "firebase/firestore"; 
import { auth, db } from '../ConnectFirebase/firebaseConfig'; 
import leaderboardService from '../ConnectFirebase/LeaderboardService';
import MissionService from '../ConnectFirebase/MissionService';

class AuthService {
  // Generate random character name
  generateRandomCharacterName() {
    return 'Chicken_' + Math.floor(Math.random() * 10000);
  }

  // Register a new user
  async register(username, email, password, avatarUrl = null) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const defaultAvatar = avatarUrl || 'https://cdn1.iconfinder.com/data/icons/user-pictures/100/unknown-1024.png';
      const characterName = this.generateRandomCharacterName();

      // Save basic user information to 'users' table
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: username,
        email: email,
        password: password,
        avatar: defaultAvatar,
        characterName: characterName,
        totalCoins: 0,
        totalMinedCoins: 0,
        level: 0,
      });

      console.log("Basic user info saved in 'users' collection");

      // Sync user to leaderboard
      await leaderboardService.syncUserToLeaderboard(user.uid);

      // Initialize login info in 'login_info' collection
      await setDoc(doc(db, 'login_info', user.uid), {
        loginDays: 0,
        lastLoginDate: null,
        eliteRewardGiven: false,
        claimedRewards: {}, // Khởi tạo phần thưởng đã nhận
        lastDailyRewardClaimed: null
      });

      console.log("Login info initialized in 'login_info' collection");

      // Initialize boosters in 'boosters' collection
      await setDoc(doc(db, 'boosters', user.uid), {
        energyLimitLevel: 1,
        freeBoosts: 4,
        multitapLevel: 1,
        upgradeCost: 1000,
      });

      // Initialize energy in 'energy' collection
      await setDoc(doc(db, 'energy', user.uid), {
        currentEnergy: 3000,
        maxEnergy: 3000,
        tapValue: 10,
      });

      console.log("Boosters and Energy initialized in separate collections");

      // Create default mission for this user
      await MissionService.createMissionForUser(user.uid, "Daily Login", "Log in for 7 consecutive days", 500, 1);

      return user;
    } catch (error) {
      console.error("Error registering user:", error);
      throw new Error("Registration failed. Please try again.");
    }
  }

  // Login User
  async login(username, password) {
    try {
      // Query Firestore to find the user by username
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
  
      // Log how many users were found
      console.log("Users found:", querySnapshot.size);
  
      // Check if user exists
      if (querySnapshot.empty) {
        throw new Error('Username not found');
      }
  
      // Extract the email from the user document
      let email;
      querySnapshot.forEach((doc) => {
        email = doc.data().email; // Assuming email is stored in the user document
      });
  
      // Log the email to confirm
      console.log("Email found for user:", email);
  
      // Use Firebase Auth to log in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully");
  
      // Update login information in 'login_info' table
      await this.updateLoginDays(userCredential.user.uid);
  
      // Sync data after login
      await leaderboardService.syncUserToLeaderboard(userCredential.user.uid);
  
      return userCredential.user; // Return the user object upon successful login
    } catch (error) {
      console.error("Error logging in user:", error);
      // Handle specific error codes for better user feedback
      if (error.code === 'auth/wrong-password') {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.message.includes("Username not found")) {
        throw new Error("Username does not exist.");
      } else {
        throw new Error("Login failed. Please try again.");
      }
    }
  }
  

  // Get the current user from Firebase Auth
  async getCurrentUser() {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(user);
        } else {
          reject(new Error("No user is currently logged in."));
        }
      });
    });
  }

  // Update user coins and level in 'users' table
  async updateUserCoinsAndLevel(uid, newTotalCoins, newCurrentLevel, coinsEarned = 0) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
            throw new Error(`User ${uid} not found.`);
        }

        const userData = userDoc.data();
        const updatedMinedCoins = userData.totalMinedCoins + coinsEarned;

        await setDoc(doc(db, 'users', uid), {
            totalCoins: newTotalCoins,
            totalMinedCoins: updatedMinedCoins,
            level: newCurrentLevel,
        }, { merge: true });

        // Sync data to leaderboard
        await leaderboardService.syncUserToLeaderboard(uid);
    } catch (error) {
        console.error("Error updating user's coins and level:", error);
    }
  }

  // Update login days in 'login_info' table
  async updateLoginDays(uid) {
    const loginDoc = doc(db, 'login_info', uid);
    const loginSnapshot = await getDoc(loginDoc);
    const today = new Date().toDateString();

    if (loginSnapshot.exists()) {
      const loginData = loginSnapshot.data();
      const lastLoginDate = loginData.lastLoginDate?.toDate().toDateString();

      if (lastLoginDate !== today) {
        const newLoginDays = loginData.loginDays + 1;
        await setDoc(loginDoc, {
          loginDays: newLoginDays,
          lastLoginDate: new Date(),
          eliteRewardGiven: newLoginDays >= 7 ? true : loginData.eliteRewardGiven,
        }, { merge: true });

        if (newLoginDays === 7) {
          await this.updateUserCoinsAndLevel(uid, loginData.totalCoins + 500, loginData.level, 500);
        }
      }
    }
  }
  // Check if username already exists
  async checkUsername(username) {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Trả về true nếu tên người dùng đã tồn tại
  }

  // Check if email already exists
  async checkEmail(email) {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Trả về true nếu email đã tồn tại
  }

  
}

export default new AuthService();
