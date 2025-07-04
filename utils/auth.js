import AsyncStorage from '@react-native-async-storage/async-storage';

// Authentication utility functions
export const authUtils = {
  // Store authentication data
  async setAuthData(token, userData) {
    try {
      // Validate inputs
      if (!token) {
        console.error('Token is required for setAuthData. Received:', token);
        return false;
      }
      
      if (!userData) {
        console.error('User data is required for setAuthData. Received:', userData);
        return false;
      }
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error storing auth data:', error);
      return false;
    }
  },

  // Get stored token
  async getToken() {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Get stored user data
  async getUserData() {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      return userDataString ? JSON.parse(userDataString) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Clear authentication data (logout)
  async clearAuthData() {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return true;
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return false;
    }
  },

  // Get auth headers for API requests
  async getAuthHeaders() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  }
}; 