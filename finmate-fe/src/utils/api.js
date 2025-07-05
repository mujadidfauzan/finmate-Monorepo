import axios from 'axios';
import Constants from 'expo-constants';

//Jan, Base URlnya rubah ya sesuai IP address laptop lu
const BASE_URL = 'http://192.168.140.177:8000';
const DEFAULT_TOKEN = Constants.expoConfig.extra.DEFAULT_TOKEN;
console.log('Using DEFAULT_TOKEN:', DEFAULT_TOKEN);

export const transcribeVoice = async (audioUri, token = DEFAULT_TOKEN) => {
  try {
    const formData = new FormData();

    // Create file object from URI
    const audioFile = {
      uri: audioUri,
      type: 'audio/mpeg',
      name: 'voice_recording.mp3',
    };

    formData.append('file', audioFile);

    console.log('Uploading audio file:', audioUri);

    const response = await axios.post(`${BASE_URL}/voice/transcribe-voice`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
    });

    console.log('Transcription response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Transcribe Error:', error.response?.data || error.message);

    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.detail || 'Server error occurred');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error('Failed to upload audio file');
    }
  }
};

// Additional utility functions for the API
export const getTransactions = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Get transactions error:', error);
    throw error;
  }
};

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (username, password, email) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      username,
      password,
      email,
    });
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const chatWithBot = async (message, session_id, token = DEFAULT_TOKEN) => {
  try {
    const response = await axios.post(`${BASE_URL}/chat/chatbot/message`, {
      message: message,
      session_id: session_id,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    throw error;
  }
};

export const getOrCreateSession = async (token = DEFAULT_TOKEN) => {
  try {
    const response = await axios.post(`${BASE_URL}/chat/chatbot/session`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Session error:', error.response?.data || error.message);
    throw error;
  }
};

export const getProfile = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error.response?.data || error.message);
    throw error;
  }
};
