import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";

class MissionService {
  
  // Create a new mission for a specific user
  async createMissionForUser(uid, title, description, reward, unlockLevel) {
    const missionId = `mission_${Date.now()}`; // Generate a unique mission ID
    const userMissionId = `${uid}_${missionId}`; // Create a unique ID for user-mission relationship

    // Store the mission details in the 'missions' collection
    await setDoc(doc(db, 'missions', missionId), {
      title,
      description,
      reward,
      unlockLevel,
      isCompleted: false,
      timestamp: new Date(),
    });

    // Store the user-mission relationship in a separate collection
    await setDoc(doc(db, 'userMissions', userMissionId), {
      uid,
      missionId,
      isCompleted: false,
      timestamp: new Date(),
    });

    console.log("Mission created successfully for user", uid);
  }

  // Get all missions for a specific user
  async getUserMissions(uid) {
    const q = query(collection(db, 'userMissions'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    const missions = [];
    querySnapshot.forEach((doc) => {
      missions.push({ id: doc.id, ...doc.data() });
    });
    return missions;
  }

  // Mark mission as completed for a user
  async completeUserMission(uid, missionId) {
    const userMissionId = `${uid}_${missionId}`;
    await setDoc(doc(db, 'userMissions', userMissionId), {
      isCompleted: true,
      completionDate: new Date(),
    }, { merge: true });

    console.log("Mission completed for user", uid);
  }
}

export default new MissionService();
