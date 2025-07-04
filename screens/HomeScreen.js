import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authUtils } from '../utils/auth';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';


// API Configuration
// For development, use your computer's IP address instead of localhost
// Find your IP with: ifconfig (mac/linux) or ipconfig (windows)
const API_BASE_URL = 'http://192.168.1.XXX:5001/api'; // Replace XXX with your actual IP
// Alternative: const API_BASE_URL = 'http://localhost:5000/api'; // For web development

// API Service Functions
const apiService = {
  // Authentication
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Attendance
  async logAttendance(qrCodeData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          qrCodeData,
          location: {
            type: 'Point',
            coordinates: [0, 0] // You can get actual coordinates from device GPS
          },
          notes: 'Scanned via InstaQ mobile app'
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Attendance logging error:', error);
      throw error;
    }
  },

  async getAttendanceStats(token, date = null) {
    try {
      const url = date 
        ? `${API_BASE_URL}/attendance/stats?date=${date}`
        : `${API_BASE_URL}/attendance/stats`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  },

  // Family Management
  async getFamilyMembers(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/family`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Get family members error:', error);
      throw error;
    }
  },

  async addFamilyMember(memberData, token) {
    try {
      console.log('API call - URL:', `${API_BASE_URL}/family`);
      console.log('API call - Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'No token'}`,
      });
      console.log('API call - Body:', memberData);
      
      const response = await fetch(`${API_BASE_URL}/family`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(memberData),
      });
      
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      return data;
    } catch (error) {
      console.error('Add family member error:', error);
      throw error;
    }
  },

  async deleteFamilyMember(memberId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/family/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Delete family member error:', error);
      throw error;
    }
  }
};

export default function HomeScreen() {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null); // In a real app, get this from secure storage
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString(),
    familyMembers: []
  });
  const [newMember, setNewMember] = useState({
    name: '',
    age: '',
    isChild: false,
    phone: '',
    address: '',
    emergencyContact: ''
  });
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedQR, setScannedQR] = useState(false);
  const cameraRef = useRef(null);

  // Get token from AsyncStorage on component mount
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await authUtils.getToken();
        console.log('Loaded token from storage:', token ? token.substring(0, 20) + '...' : 'No token');
        
        if (token) {
          setUserToken(token);
          // Also load family members if we have a token
          loadFamilyMembers(token);
        } else {
          console.log('No token found in storage');
        }
      } catch (error) {
        console.error('Error getting token:', error);
      }
    };
    
    getToken();
  }, []);

  const loadFamilyMembers = async (token) => {
    try {
      // First test if token is valid
      const testResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!testResponse.ok) {
        console.log('Token validation failed, status:', testResponse.status);
        // Token might be expired, clear it and redirect to login
        await authUtils.clearAuthData();
        Alert.alert('Session Expired', 'Please log in again.');
        return;
      }
      
      const response = await apiService.getFamilyMembers(token);
      if (response.success) {
        setFamilyMembers(response.data.familyMembers);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const handleScanAttendance = () => {
    Alert.alert(
      'Attendance Options',
      'Choose how you want to log attendance',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Scan QR Code', onPress: () => setShowScanModal(true) },
        { text: 'Generate QR Code', onPress: () => setShowGenerateModal(true) }
      ]
    );
  };

  // Handler for QR code scanned
  const handleQRCodeScanned = async ({ data }) => {
    if (scannedQR) return; // Prevent multiple scans
    setScannedQR(true);
    setIsLoading(true);
    try {
      // Send scanned QR data to backend
      const response = await apiService.logAttendance(data, userToken);
      if (response.success) {
        Alert.alert(
          'QR Code Scanned Successfully!',
          response.message || 'Attendance logged.',
          [
            { text: 'OK', onPress: () => setShowScanModal(false) }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to log attendance');
      }
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', 'Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setScannedQR(false), 2000); // Allow scanning again after 2s
    }
  };

  const generateAttendanceQR = () => {
    const qrData = {
      type: 'attendance',
      date: attendanceData.date,
      time: attendanceData.time,
      familyMembers: familyMembers.map(member => ({
        name: member.name,
        age: member.age,
        isChild: member.isChild
      }))
    };
    return JSON.stringify(qrData);
  };

  const handleAddMember = async () => {
    console.log('Form validation - name:', newMember.name, 'age:', newMember.age);
    console.log('Full newMember state:', newMember);
    
    if (newMember.name && newMember.age) {
      if (!userToken) {
        Alert.alert('Error', 'Please log in to add family members');
        return;
      }

      // Test token validity before proceeding
      try {
        const testResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        });
        
        if (!testResponse.ok) {
          console.log('Token is invalid, status:', testResponse.status);
          await authUtils.clearAuthData();
          Alert.alert('Session Expired', 'Please log in again to continue.');
          return;
        }
      } catch (error) {
        console.error('Token validation error:', error);
        Alert.alert('Connection Error', 'Unable to verify your session. Please try again.');
        return;
      }

      setIsLoading(true);
      
      try {
        const memberData = {
          name: newMember.name, // This is correct - backend expects 'name'
          age: parseInt(newMember.age),
          isChild: newMember.isChild,
          phone: newMember.phone || undefined,
          address: newMember.address || undefined,
          emergencyContact: newMember.emergencyContact || undefined
        };

        console.log('Adding family member with token:', userToken ? userToken.substring(0, 20) + '...' : 'No token');
        console.log('Member data:', memberData);
        
        const response = await apiService.addFamilyMember(memberData, userToken);
        console.log('Add family member response:', response);
        
        if (response.success) {
          const member = {
            id: response.data.familyMember.id,
            ...memberData
          };
          setFamilyMembers([...familyMembers, member]);
          setNewMember({
            name: '',
            age: '',
            isChild: false,
            phone: '',
            address: '',
            emergencyContact: ''
          });
          setShowAddModal(false);
          Alert.alert('Success', 'Family member added successfully!');
        } else {
          Alert.alert('Error', response.message || 'Failed to add family member');
        }
      } catch (error) {
        console.error('Add member error:', error);
        Alert.alert('Error', 'Failed to connect to server. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert('Error', 'Please fill in name and age.');
    }
  };

  const handleRemoveMember = async (id) => {
    if (!userToken) {
      Alert.alert('Error', 'Please log in to remove family members');
      return;
    }

    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this family member?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
          setIsLoading(true);
          try {
            const response = await apiService.deleteFamilyMember(id, userToken);
            
            if (response.success) {
              setFamilyMembers(familyMembers.filter(member => member.id !== id));
              Alert.alert('Success', 'Family member removed successfully!');
            } else {
              Alert.alert('Error', response.message || 'Failed to remove family member');
            }
          } catch (error) {
            console.error('Remove member error:', error);
            Alert.alert('Error', 'Failed to connect to server. Please try again.');
          } finally {
            setIsLoading(false);
          }
        }}
      ]
    );
  };

  const toggleMemberType = () => {
    setNewMember({...newMember, isChild: !newMember.isChild});
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>Welcome to InstaQ</Text>
              <Text style={styles.subtitleText}>Your Church Community Hub</Text>
            </View>
            <TouchableOpacity style={styles.scanButton} onPress={handleScanAttendance}>
              <Ionicons name="qr-code" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Quick Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="people" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.statNumber}>127</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="calendar" size={20} color="#10b981" />
              </View>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.statNumber}>89%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
          </View>

          {/* Attendance Scanner Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="qr-code-outline" size={24} color="#1f2937" />
              <Text style={styles.sectionTitle}>Log Attendance</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Scan a QR code or generate one for your family to log attendance
            </Text>
            <View style={styles.attendanceButtons}>
              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.disabledButton]} 
                onPress={() => setShowScanModal(true)}
                disabled={isLoading}
              >
                <Ionicons name="camera" size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Processing...' : 'Scan QR Code'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.secondaryButton, isLoading && styles.disabledButton]} 
                onPress={() => setShowGenerateModal(true)}
                disabled={isLoading}
              >
                <Ionicons name="qr-code" size={25} color="#22223b" />
                <Text style={styles.secondaryButtonText}>Generate QR Code</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Family Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={24} color="#1f2937" />
              <Text style={styles.sectionTitle}>Family Members</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Add and manage your family members' information
            </Text>
            
            {/* Family Members List */}
            <View style={styles.membersList}>
              {familyMembers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateText}>No family members added yet</Text>
                  <Text style={styles.emptyStateSubtext}>Tap the button below to add your first family member</Text>
                </View>
              ) : (
                familyMembers.map((member) => (
                  <View key={member.id} style={styles.memberCard}>
                    <View style={styles.memberHeader}>
                      <View style={styles.memberInfo}>
                        <View style={styles.memberNameRow}>
                          <Text style={styles.memberName}>{member.name}</Text>
                          <View style={[styles.memberType, { backgroundColor: member.isChild ? '#fef3c7' : '#dbeafe' }]}>
                            <Text style={[styles.memberTypeText, { color: member.isChild ? '#d97706' : '#2563eb' }]}>
                              {member.isChild ? 'Child' : 'Adult'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.memberAge}>{member.age} years old</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleRemoveMember(member.id)}
                        disabled={isLoading}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    
                    {!member.isChild && (
                      <View style={styles.memberDetails}>
                        {member.phone && (
                          <View style={styles.detailRow}>
                            <Ionicons name="call-outline" size={16} color="#6b7280" />
                            <Text style={styles.detailText}>{member.phone}</Text>
                          </View>
                        )}
                        {member.address && (
                          <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={16} color="#6b7280" />
                            <Text style={styles.detailText}>{member.address}</Text>
                          </View>
                        )}
                        {member.emergencyContact && (
                          <View style={styles.detailRow}>
                            <Ionicons name="medical-outline" size={16} color="#6b7280" />
                            <Text style={styles.detailText}>{member.emergencyContact}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity 
              style={[styles.addButton, isLoading && styles.disabledButton]} 
              onPress={() => setShowAddModal(true)}
              disabled={isLoading}
            >
              <Ionicons name="add" size={24} color="#ffffff" />
              <Text style={styles.addButtonText}>Add Family Member</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Activities Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={24} color="#1f2937" />
              <Text style={styles.sectionTitle}>Recent Activities</Text>
            </View>
            
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Sunday Service Attendance</Text>
                  <Text style={styles.activityTime}>Today, 10:30 AM</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="calendar" size={20} color="#d97706" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Bible Study Registration</Text>
                  <Text style={styles.activityTime}>Yesterday, 2:00 PM</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#ede9fe' }]}>
                  <Ionicons name="people" size={20} color="#7c3aed" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Youth Group Meeting</Text>
                  <Text style={styles.activityTime}>2 days ago</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Upcoming Events Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={24} color="#1f2937" />
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
            </View>
            
            <View style={styles.eventList}>
              <View style={styles.eventItem}>
                <View style={styles.eventDate}>
                  <Text style={styles.eventDay}>15</Text>
                  <Text style={styles.eventMonth}>DEC</Text>
                </View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>Christmas Carol Service</Text>
                  <Text style={styles.eventTime}>7:00 PM - Main Hall</Text>
                </View>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Join</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.eventItem}>
                <View style={styles.eventDate}>
                  <Text style={styles.eventDay}>20</Text>
                  <Text style={styles.eventMonth}>DEC</Text>
                </View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>Prayer Meeting</Text>
                  <Text style={styles.eventTime}>6:30 PM - Prayer Room</Text>
                </View>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Family Member</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  placeholderTextColor="#9ca3af"
                  value={newMember.name}
                  onChangeText={(text) => setNewMember({...newMember, name: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter age"
                  placeholderTextColor="#9ca3af"
                  value={newMember.age}
                  onChangeText={(text) => setNewMember({...newMember, age: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Member Type</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity 
                    style={[styles.typeOption, !newMember.isChild && styles.typeOptionActive]}
                    onPress={() => setNewMember({...newMember, isChild: false})}
                  >
                    <Ionicons name="person" size={20} color={!newMember.isChild ? "#3b82f6" : "#9ca3af"} />
                    <Text style={[styles.typeOptionText, !newMember.isChild && styles.typeOptionTextActive]}>Adult</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.typeOption, newMember.isChild && styles.typeOptionActive]}
                    onPress={() => setNewMember({...newMember, isChild: true})}
                  >
                    <Ionicons name="happy" size={20} color={newMember.isChild ? "#3b82f6" : "#9ca3af"} />
                    <Text style={[styles.typeOptionText, newMember.isChild && styles.typeOptionTextActive]}>Child</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!newMember.isChild && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter phone number"
                      placeholderTextColor="#9ca3af"
                      value={newMember.phone}
                      onChangeText={(text) => setNewMember({...newMember, phone: text})}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter address"
                      placeholderTextColor="#9ca3af"
                      value={newMember.address}
                      onChangeText={(text) => setNewMember({...newMember, address: text})}
                      multiline
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Emergency Contact</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter emergency contact"
                      placeholderTextColor="#9ca3af"
                      value={newMember.emergencyContact}
                      onChangeText={(text) => setNewMember({...newMember, emergencyContact: text})}
                    />
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && styles.disabledButton]} 
              onPress={handleAddMember}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Adding...' : 'Add Member'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Code Scanner Modal (Real Camera) */}
      <Modal
        visible={showScanModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowScanModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scan QR Code</Text>
            <TouchableOpacity onPress={() => setShowScanModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.scannerContent}>
            {permission?.granted ? (
              <View style={styles.cameraWrapper}>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                  onBarcodeScanned={handleQRCodeScanned}
                />
                <View style={styles.scanOverlay}>
                  <Text style={styles.scanOverlayText}>Align QR code within the frame</Text>
                </View>
              </View>
            ) : (
              <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>Camera permission is required to scan QR codes.</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
                  <Text style={styles.primaryButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.scannerPlaceholderText}>
              Point your camera at a QR code to scan and log attendance.
            </Text>
          </View>
        </View>
      </Modal>

      {/* QR Code Generator Modal */}
      <Modal
        visible={showGenerateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Generate Attendance QR Code</Text>
            <TouchableOpacity onPress={() => setShowGenerateModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.qrGeneratorContent}>
              <Text style={styles.qrDescription}>
                Generate a QR code for your family's attendance. This QR code will include all your family members and can be scanned by church staff.
              </Text>
              
              {familyMembers.length > 0 ? (
                <View style={styles.qrCodeContainer}>
                  <QRCode
                    value={generateAttendanceQR()}
                    size={200}
                    color="#000000"
                    backgroundColor="#ffffff"
                  />
                  <Text style={styles.qrCodeLabel}>Your Family Attendance QR Code</Text>
                  <Text style={styles.qrCodeInfo}>
                    Date: {attendanceData.date} | Time: {attendanceData.time}
                  </Text>
                  <Text style={styles.qrCodeInfo}>
                    Family Members: {familyMembers.length}
                  </Text>
                </View>
              ) : (
                <View style={styles.noMembersState}>
                  <Ionicons name="people-outline" size={48} color="#9ca3af" />
                  <Text style={styles.noMembersText}>No family members added</Text>
                  <Text style={styles.noMembersSubtext}>
                    Add family members first to generate an attendance QR code
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowGenerateModal(false)}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    marginTop: 10,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Poppins-Bold',
    color: '#22223b',
    marginBottom: 6,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
    fontWeight: '500',
  },
  scanButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginLeft: 12,
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  membersList: {
    gap: 16,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 12,
  },
  memberType: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  memberTypeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  memberAge: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  memberDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    gap: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
    flex: 1,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  activityTime: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  eventList: {
    gap: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  eventDate: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 56,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  eventDay: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: -0.5,
  },
  eventMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  eventTime: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  modalContent: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  typeOptionActive: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  typeOptionTextActive: {
    color: '#6366f1',
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Scanner Styles (Real Camera)
  scannerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  cameraWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  camera: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scanOverlay: {
    position: 'absolute',
    top: '45%',
    left: '10%',
    width: '80%',
    height: 60,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  scanOverlayText: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 24,
  },
  permissionText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  scannerPlaceholderText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
    fontWeight: '500',
  },
  // QR Generator Styles
  qrGeneratorContent: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
  },
  qrDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: '500',
  },
  qrCodeContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  qrCodeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  qrCodeInfo: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '500',
  },
  noMembersState: {
    alignItems: 'center',
    padding: 48,
  },
  noMembersText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  noMembersSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
});
