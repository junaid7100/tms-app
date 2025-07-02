import { createClient } from '@supabase/supabase-js';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import { REACT_APP_SUPABASE_URL, REACT_APP_ANON_KEY } from '@env';

if (!REACT_APP_SUPABASE_URL || !REACT_APP_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase with URL:', REACT_APP_SUPABASE_URL);

export const supabase = createClient(REACT_APP_SUPABASE_URL, REACT_APP_ANON_KEY, {
  auth: {
    persistSession: false
  }
});

// Verify Supabase connection
const verifyConnection = async () => {
  try {
    const { data, error } = await supabase.from('phq9_form').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection verification failed:', error);
    return false;
  }
};

// Call verification on initialization
verifyConnection();

// Helper function to check network connectivity
export const checkNetworkConnection = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected;
};

// Helper function to handle Supabase operations with network check
export const supabaseOperation = async (operation) => {
  try {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    // Verify Supabase connection before operation
    const isSupabaseConnected = await verifyConnection();
    if (!isSupabaseConnected) {
      throw new Error('Unable to connect to the database. Please try again later.');
    }

    return await operation();
  } catch (error) {
    console.error('Supabase operation error:', error);
    if (error.message.includes('Network request failed')) {
      throw new Error('Network request failed. Please check your internet connection and try again.');
    }
    throw error;
  }
}; 