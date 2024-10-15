// componentsSetting/ProfileInfo.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { doc, getDoc } from 'firebase/firestore'; // Firestore imports
import { db, auth } from '../ConnectFirebase/firebaseConfig'; // Firebase config import

const defaultAvatar = 'https://tse4.mm.bing.net/th?id=OIG4.qzg0wQGKlcn1Hu5vP9MD&pid=ImgGn'; // Fallback avatar URL

const ProfileInfo = () => {
  const [profile, setProfile] = useState({ avatar: '', name: '', email: '' });

  useEffect(() => {
    fetchUserProfile(); // Load user profile on component mount
  }, []);

  // Function to fetch user profile from Firestore
  const fetchUserProfile = async () => {
    try {
      const user = auth.currentUser; // Get the current logged-in user
      if (user) {
        const docRef = doc(db, 'users', user.uid); // Assume 'users' collection has user data
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfile({
            avatar: userData.avatar || defaultAvatar, // Use default avatar if undefined
            name: userData.characterName || user.displayName || 'No Name Provided',
            email: user.email,
          });
        } else {
          console.log('No user data found in Firestore');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: profile.avatar || defaultAvatar }} // Fallback to default if avatar is empty
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  infoContainer: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileInfo;
