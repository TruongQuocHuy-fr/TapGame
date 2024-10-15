import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthService from './AuthService'; // Import the AuthService
import Toast from 'react-native-toast-message'; // Thêm Toast để thông báo
import { Formik } from 'formik';
import * as Yup from 'yup'; // Import Yup

const RegisterScreen = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false); // Để hiện/ẩn mật khẩu

  // Định nghĩa schema xác thực với Yup
  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const handleRegister = async (values) => {
    const { username, email, password } = values;

    try {
      // Kiểm tra xem username và email đã tồn tại chưa
      const isUsernameTaken = await AuthService.checkUsername(username);
      const isEmailTaken = await AuthService.checkEmail(email);

      if (isUsernameTaken) {
        Toast.show({
          type: 'error',
          text1: 'Registration Error',
          text2: 'Username already exists. Please choose another.',
        });
        return;
      }

      if (isEmailTaken) {
        Toast.show({
          type: 'error',
          text1: 'Registration Error',
          text2: 'Email already exists. Please choose another.',
        });
        return;
      }

      // Nếu username và email chưa tồn tại, tiến hành đăng ký
      await AuthService.register(username, email, password); // Pass only username, email, password
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Registration completed! Please login.',
      });
      navigation.replace('Login');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Error',
        text2: error.message || 'Something went wrong.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://tse2.mm.bing.net/th?id=OIG3.a3iAFjVlXDfC8Etj9CoB&pid=ImgGn' }}
        style={styles.logo}
      />

      <Formik
        initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
        validationSchema={validationSchema}
        onSubmit={handleRegister}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
          <>
            {/* Username Input */}
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={values.username}
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
            />
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

            {/* Email Input */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Password Input */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Password"
                value={values.password}
                secureTextEntry={!showPassword} // Hiện/ẩn mật khẩu
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {/* Confirm Password Input */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Confirm Password"
                value={values.confirmPassword}
                secureTextEntry={!showPassword} // Hiện/ẩn mật khẩu
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, { opacity: 
                values.username && values.email && values.password && values.confirmPassword ? 1 : 0.5 }]} // Thay đổi độ mờ
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            {/* Already have an account? */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>

      {/* Toast Message */}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20, // Khoảng cách giữa logo và tiêu đề
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 20,
  },
  inputPassword: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  registerButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  loginText: {
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default RegisterScreen;
