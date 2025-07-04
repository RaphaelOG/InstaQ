import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, StatusBar, Platform, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authUtils } from '../utils/auth';

// API Configuration - same as HomeScreen
const API_BASE_URL = 'http://192.168.1.160:5001/api'; // Replace with your actual IP

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        // Check if we have the expected data structure
        if (!data.data || !data.data.token || !data.data.user) {
          console.error('Unexpected response structure:', data);
          Alert.alert('Login Error', 'Invalid response from server. Please try again.');
          return;
        }
        
        // Store the token securely using auth utility
        await authUtils.setAuthData(data.data.token, data.data.user);
        
        Alert.alert('Success', 'Login successful!', [
          { text: 'OK', onPress: () => navigation.replace('MainApp') }
        ]);
      } else {
        // Handle validation errors
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map(error => error.msg).join('\n');
          Alert.alert('Login Failed', errorMessages);
        } else {
          Alert.alert('Login Failed', data.message || 'Invalid email or password');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Network Error', 'Unable to connect to server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} backgroundColor="transparent" translucent />
      {/* InstaQ Logo in top right */}
      <Image source={require('../assets/InstaQ.png')} style={styles.logoTopRight} resizeMode="contain" />
      {/* Vibrant, elegant background gradient */}
      <LinearGradient
        colors={["#DFE0E2", "#e8eaee"]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>
        {/* Glass Effect Form Container */}
        <BlurView intensity={30} style={styles.glassContainer} tint="light">
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#b0b3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                selectionColor="#232323"
                editable={!isLoading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#b0b3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                selectionColor="#232323"
                editable={!isLoading}
              />
            </View>
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.forgotPassword} disabled={isLoading}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
        {/* Sign Up Link */}
        <View style={styles.signupSection}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} disabled={isLoading}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  logoTopRight: {
    position: 'absolute',
    top: 56,
    right: 24,
    width: 80,
    height: 80,
    zIndex: 10,
    
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#232323',
    marginBottom: 8,
    letterSpacing: -1.2,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b6b6b',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  glassContainer: {
    borderRadius: 28,
    borderWidth: 1.2,
    borderColor: 'rgba(220,220,230,0.18)',
    overflow: 'hidden',
    marginBottom: 36,
    minWidth: 340,
    maxWidth: 400,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    shadowColor: '#22223b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
  },
  form: {
    padding: 36,
    paddingVertical: 44,
    width: '100%',
  },
  inputContainer: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#232323',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: 'rgba(245,245,250,0.7)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#232323',
    fontWeight: '400',
  },
  loginButton: {
    backgroundColor: '#22223b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
    shadowColor: '#22223b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  loginButtonDisabled: {
    backgroundColor: '#6b7280',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 0,
  },
  forgotPasswordText: {
    color: '#22223b',
    fontSize: 15,
    fontWeight: '400',
    textDecorationLine: 'underline',
    letterSpacing: 0.1,
  },
  signupSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    color: '#6b6b6b',
    fontSize: 15,
    fontWeight: '400',
  },
  signupLink: {
    color: '#22223b',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
}); 