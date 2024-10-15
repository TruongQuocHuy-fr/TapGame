import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AuthService from './AuthService'; // Import the AuthService
import { Ionicons } from '@expo/vector-icons'; // Sử dụng Icon từ Expo
import Toast from 'react-native-toast-message'; // Thông báo Toast
import { Formik } from 'formik';
import * as Yup from 'yup'; // Import Yup

const LoginScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [showPassword, setShowPassword] = useState(false); // Trạng thái để hiện/ẩn mật khẩu

  // Định nghĩa schema xác thực với Yup
  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleLogin = async (values) => {
    const { username, password } = values;

    try {
      setIsLoading(true); // Bắt đầu loading
      await AuthService.login(username, password);
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
      });
      // Navigate to MainTabs after login success
      navigation.replace('Main');
    } catch (error) {
      // Ghi log lỗi ra console và không hiển thị thông báo
      console.error('Error logging in user:', error); // Ghi log lỗi ra console
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  return (
    <View style={styles.container}>
      {/* Hiển thị ActivityIndicator khi đang tải */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF9800" />
        </View>
      )}

      {/* Thêm logo vào phía trên */}
      <Image
        source={{ uri: 'https://tse2.mm.bing.net/th?id=OIG3.a3iAFjVlXDfC8Etj9CoB&pid=ImgGn' }}
        style={styles.logo}
      />

      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
          <>
            {/* Username Input with Icon */}
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={24} color="gray" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={values.username}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
              />
            </View>
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

            {/* Password Input with Icon */}
            <View style={styles.passwordContainer}>
              <Ionicons name="lock-closed" size={24} color="gray" style={styles.inputIcon} />
              <TextInput
                style={styles.inputPassword}
                placeholder="Password"
                value={values.password}
                secureTextEntry={!showPassword}
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

            {/* Chữ "Quên mật khẩu" nằm dưới ô nhập mật khẩu và bên phải */}
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Nút Login */}
            <TouchableOpacity
              style={[styles.loginButton, { opacity: values.username && values.password ? 1 : 0.5 }]} // Đổi độ mờ tùy thuộc vào điều kiện
              onPress={handleSubmit}
              disabled={!values.username || !values.password || isLoading} // Vô hiệu hóa nút nếu không có dữ liệu hoặc đang tải
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Login</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <View style={styles.registerContainer}>
                <Ionicons />
                <Text style={styles.registerText}>Don't have an account? Register</Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </Formik>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5', // Thêm nền sáng
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Màu nền mờ
    zIndex: 1, // Đảm bảo loading indicator nằm trên nội dung
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20, // Khoảng cách giữa logo và tiêu đề
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  inputIcon: {
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  inputPassword: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  forgotPasswordText: {
    color: '#FF9800',
    textAlign: 'right', // Căn bên phải
    marginTop: 10,
    alignSelf: 'flex-end', // Đặt vị trí bên phải
  },
  loginButton: {
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
  buttonContent: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#FF9800',
    marginLeft: 10, // Khoảng cách giữa icon và text
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default LoginScreen;