import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Elegant Background Gradient */}
      <LinearGradient
        colors={["#DFE0E2", "#e8eaee"]}
        style={styles.background}
      />
      <View style={styles.content}>
        {/* Logo & Tagline */}
        <View style={styles.logoSection}>
          <Text style={styles.logo}>InstaQ</Text>
          <Text style={styles.tagline}>Seamless Attendance, Instantly</Text>
        </View>
        {/* Glassy QR Card */}
        <View style={styles.glassCard}>
          <View style={styles.qrSection}>
            <Image source={require('../assets/PathImage.png')} style={styles.qrImage} resizeMode="contain" />
          </View>
          <LinearGradient
            colors={["rgba(255,255,255,0.00)", "rgba(240,240,245,0.0)"]}
            style={styles.glassGradient}
          />
        </View>
        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingTop: 0,
    paddingBottom: 0,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 44,
  },
  logo: {
    fontSize: 54,
    fontWeight: '800',
    color: '#232323',
    letterSpacing: -2,
    fontFamily: 'System',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#6b6b6b',
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  glassCard: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 36,
    overflow: 'hidden',
    marginBottom: 48,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(220,220,230,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  qrImage: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
    zIndex: 3,
  },
  glassGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  actionSection: {
    width: '100%',
    marginTop: 0,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#22223b',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
    width: width * 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  signupButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#22223b',
    alignItems: 'center',
    width: width * 0.7,
  },
  signupButtonText: {
    color: '#232323',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
}); 