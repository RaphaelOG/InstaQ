import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, StatusBar, Platform, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authUtils } from '../utils/auth';

// API Configuration - same as HomeScreen
const API_BASE_URL = 'http://192.168.1.XXX:5001/api'; // Replace with your actual IP

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !fullName || !password) {
      Alert.alert('Error', 'Please fill in email, full name, and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          phone: phone || undefined,
          address: address || undefined,
        }),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (response.ok) {
        // Check if we have the expected data structure
        if (!data.data || !data.data.token || !data.data.user) {
          console.error('Unexpected response structure:', data);
          Alert.alert('Registration Error', 'Invalid response from server. Please try again.');
          return;
        }
        
        // Store the token securely using auth utility
        await authUtils.setAuthData(data.data.token, data.data.user);
        
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigation.replace('MainApp') }
        ]);
      } else {
        // Handle validation errors
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map(error => error.msg).join('\n');
          Alert.alert('Registration Failed', errorMessages);
        } else {
          Alert.alert('Registration Failed', data.message || 'Unable to create account');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start your journey</Text>
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
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#b0b3b8"
                value={fullName}
                onChangeText={setFullName}
                selectionColor="#232323"
                editable={!isLoading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#b0b3b8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                selectionColor="#232323"
                editable={!isLoading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your address"
                placeholderTextColor="#b0b3b8"
                value={address}
                onChangeText={setAddress}
                selectionColor="#232323"
                editable={!isLoading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password (min 6 characters)"
                placeholderTextColor="#b0b3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                selectionColor="#232323"
                editable={!isLoading}
              />
            </View>
            <TouchableOpacity 
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]} 
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              By signing up, you agree to our Terms, Data Policy and Cookies Policy.
            </Text>
          </View>
        </BlurView>
        {/* Login Link */}
        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
            <Text style={styles.loginLink}>Log in</Text>
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
    width: 70,
    height: 70,
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
    marginBottom: 30,
    marginTop: 55,
  },
  title: {
    fontSize: 32,
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
    marginBottom: 25,
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
  signupButton: {
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
  signupButtonDisabled: {
    backgroundColor: '#6b7280',
    shadowOpacity: 0.1,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  termsText: {
    fontSize: 12,
    color: '#6b6b6b',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },
  loginSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  loginText: {
    color: '#6b6b6b',
    fontSize: 15,
    fontWeight: '400',
  },
  loginLink: {
    color: '#22223b',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
}); 
