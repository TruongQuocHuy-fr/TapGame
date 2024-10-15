import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, FlatList, TextInput } from 'react-native';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db, storage } from '../ConnectFirebase/firebaseConfig';
import Toast from 'react-native-toast-message'; 

const avatars = [
  'https://tse3.mm.bing.net/th?id=OIG4.5YgDbohKTvEH9EP6fSx4&pid=ImgGn',
  'https://tse1.mm.bing.net/th?id=OIG4.F1DmpiZ_eVk08k8SIxY5&pid=ImgGn',
  'https://tse4.mm.bing.net/th?id=OIG4.qzg0wQGKlcn1Hu5vP9MD&pid=ImgGn',
  'https://tse2.mm.bing.net/th?id=OIG3.RXu2qIcr3c839hamahOi&pid=ImgGn',
  'https://tse3.mm.bing.net/th?id=OIG3.kabKFFWukikFVdwPY2yo&pid=ImgGn',
  'https://tse2.mm.bing.net/th?id=OIG3.KnkT_ASMvlFZdzmkq1ip&pid=ImgGn',
  'https://tse3.mm.bing.net/th?id=OIG2.yW6aHmq8QzQ4zNzFgrpC&pid=ImgGn',
  'https://tse2.mm.bing.net/th?id=OIG2.zY9SyN_AuuUniKyZ4xth&pid=ImgGn',
  'https://tse4.mm.bing.net/th?id=OIG2.iVFDwugQBykoyGBXlHkA&pid=ImgGn',
  'https://tse1.mm.bing.net/th?id=OIG2.DSahT6L5BEie_9jtpfUt&pid=ImgGn',
];

const ForwardedToast = React.forwardRef((props, ref) => {
  return <Toast ref={ref} {...props} />;
});

const EditProfileScreen = () => {
  const defaultAvatarUrl = 'https://example.com/default-avatar.png';
  const [avatar, setAvatar] = useState(null); 
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [uploading, setUploading] = useState(false);
  const [showAvatarList, setShowAvatarList] = useState(false); 

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAvatar(userData.avatar || defaultAvatarUrl);
            setName(userData.characterName || '');
            setEmail(user.email || ''); 
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    setUploading(true); 

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No users logged in yet.');
      }

      let avatarUrl = avatar;

      if (avatar && !avatar.startsWith('http')) {
        const avatarRef = ref(storage, `avatars/${user.uid}.jpg`); 

        const response = await fetch(avatar);
        const blob = await response.blob();
        
        await uploadBytes(avatarRef, blob);

        avatarUrl = await getDownloadURL(avatarRef);
        console.log('Download URL:', avatarUrl); 
      }

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        characterName: name || user.displayName, 
        avatar: avatarUrl || null, 
      });

      Toast.show({
        text1: 'Profile update successful',
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        text1: 'Profile update failed',
        text2: error.message,
        type: 'error',
      });
    } finally {
      setUploading(false); 
    }
  };

  const renderAvatarItem = ({ item }) => (
    <TouchableOpacity onPress={() => {
      setAvatar(item);
      setShowAvatarList(false);
    }}>
      <Image source={{ uri: item }} style={styles.avatarOption} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <TouchableOpacity onPress={() => setShowAvatarList(!showAvatarList)}>
          <Text style={styles.changeAvatarText}>Select profile picture</Text>
        </TouchableOpacity>
      </View>

      {showAvatarList && (
        <FlatList
          data={avatars}
          renderItem={renderAvatarItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.avatarList}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter new name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        editable={false} 
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={uploading}>
        <Text style={styles.buttonText}>
          {uploading ? 'Saving...' : 'Saving changes'}
        </Text>
      </TouchableOpacity>

      <ForwardedToast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  changeAvatarText: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  avatarList: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  avatarOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditProfileScreen;