import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class OfflineStorageService {
  static PENDING_SUBMISSIONS_KEY = 'pending_form_submissions';
  static OFFLINE_DATA_KEY = 'offline_form_data';

  // Check if device is online
  static async isOnline() {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected && netInfo.isInternetReachable;
  }

  // Save form data for offline use
  static async saveOfflineFormData(formType, formData) {
    try {
      const existingData = await this.getOfflineFormData(formType);
      const newData = {
        ...existingData,
        ...formData,
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem(
        `${this.OFFLINE_DATA_KEY}_${formType}`,
        JSON.stringify(newData)
      );
      return true;
    } catch (error) {
      console.error('Error saving offline form data:', error);
      return false;
    }
  }

  // Get saved offline form data
  static async getOfflineFormData(formType) {
    try {
      const data = await AsyncStorage.getItem(`${this.OFFLINE_DATA_KEY}_${formType}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline form data:', error);
      return null;
    }
  }

  // Add form submission to pending queue
  static async addPendingSubmission(formType, formData) {
    try {
      const pendingSubmissions = await this.getPendingSubmissions();
      const newSubmission = {
        id: Date.now().toString(),
        formType,
        formData,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };
      pendingSubmissions.push(newSubmission);
      await AsyncStorage.setItem(
        this.PENDING_SUBMISSIONS_KEY,
        JSON.stringify(pendingSubmissions)
      );
      return true;
    } catch (error) {
      console.error('Error adding pending submission:', error);
      return false;
    }
  }

  // Get all pending submissions
  static async getPendingSubmissions() {
    try {
      const submissions = await AsyncStorage.getItem(this.PENDING_SUBMISSIONS_KEY);
      return submissions ? JSON.parse(submissions) : [];
    } catch (error) {
      console.error('Error getting pending submissions:', error);
      return [];
    }
  }

  // Remove a pending submission after successful sync
  static async removePendingSubmission(submissionId) {
    try {
      const pendingSubmissions = await this.getPendingSubmissions();
      const updatedSubmissions = pendingSubmissions.filter(
        submission => submission.id !== submissionId
      );
      await AsyncStorage.setItem(
        this.PENDING_SUBMISSIONS_KEY,
        JSON.stringify(updatedSubmissions)
      );
      return true;
    } catch (error) {
      console.error('Error removing pending submission:', error);
      return false;
    }
  }

  // Update retry count for a pending submission
  static async updateSubmissionRetryCount(submissionId) {
    try {
      const pendingSubmissions = await this.getPendingSubmissions();
      const updatedSubmissions = pendingSubmissions.map(submission => {
        if (submission.id === submissionId) {
          return {
            ...submission,
            retryCount: (submission.retryCount || 0) + 1
          };
        }
        return submission;
      });
      await AsyncStorage.setItem(
        this.PENDING_SUBMISSIONS_KEY,
        JSON.stringify(updatedSubmissions)
      );
      return true;
    } catch (error) {
      console.error('Error updating submission retry count:', error);
      return false;
    }
  }

  // Clear all offline data
  static async clearOfflineData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => 
        key.startsWith(this.OFFLINE_DATA_KEY) || 
        key === this.PENDING_SUBMISSIONS_KEY
      );
      await AsyncStorage.multiRemove(offlineKeys);
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  }
}

export default OfflineStorageService; 