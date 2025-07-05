import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = 'http://192.168.140.177:8000';
const DEFAULT_TOKEN = Constants.expoConfig?.extra?.DEFAULT_TOKEN || 'default_token';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// OCR Receipt Scanning Function
export const scanReceipt = async (imageUri, token = DEFAULT_TOKEN) => {
  try {
    console.log('Scanning receipt from:', imageUri);

    const formData = new FormData();

    // Create file object from URI
    const imageFile = {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    };

    formData.append('file', imageFile);

    console.log('Uploading receipt image...');

    const response = await apiClient.post(`${BASE_URL}/ocr/scan-struk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      timeout: 120000, // 120 seconds for OCR processing
    });

    console.log('OCR Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Scan Receipt Error:', error.response?.data || error.message);

    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.detail || error.response.data?.message || 'Server error occurred';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      throw new Error('Request timeout. OCR processing is taking too long.');
    } else {
      // Something else happened
      throw new Error('Failed to process receipt image');
    }
  }
};

// Voice transcription function
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

    const response = await apiClient.post(`${BASE_URL}/voice/transcribe-voice`, formData, {
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

// Transaction management functions
export const getTransactions = async (token = DEFAULT_TOKEN, params = {}) => {
  try {
    const response = await apiClient.get('/transactions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: params,
    });
    return response.data.data;
  } catch (error) {
    console.error('Get transactions error:', error);
    throw error;
  }
};

export const createTransaction = async (transactionData, token = DEFAULT_TOKEN) => {
  try {
    console.log('Creating transaction:', transactionData);

    const response = await apiClient.post('/transactions/create', transactionData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Transaction created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create Transaction Error:', error.response?.data || error.message);

    if (error.response) {
      const errorMessage = error.response.data?.detail || error.response.data?.message || 'Server error occurred';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else {
      throw new Error('Failed to create transaction');
    }
  }
};

export const updateTransaction = async (transactionId, transactionData, token = DEFAULT_TOKEN) => {
  try {
    const response = await apiClient.put(`/transactions/${transactionId}`, transactionData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Update transaction error:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId, token = DEFAULT_TOKEN) => {
  try {
    const response = await apiClient.delete(`/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Delete transaction error:', error);
    throw error;
  }
};

// Authentication functions
export const login = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
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
    const response = await apiClient.post('/auth/register', {
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

export const logout = async (token = DEFAULT_TOKEN) => {
  try {
    const response = await apiClient.post(
      '/auth/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = async (token = DEFAULT_TOKEN) => {
  try {
    const response = await apiClient.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

// Categories management
export const getCategories = async (token = DEFAULT_TOKEN) => {
  try {
    const response = await apiClient.get('/categories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get categories error:', error);
    throw error;
  }
};

// Statistics and analytics
export const getExpenseStats = async (token = DEFAULT_TOKEN, period = 'month') => {
  try {
    const response = await apiClient.get('/stats/expenses', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        period: period,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get expense stats error:', error);
    throw error;
  }
};

// Export/Import functions
export const exportTransactions = async (token = DEFAULT_TOKEN, format = 'csv') => {
  try {
    const response = await apiClient.get('/export/transactions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        format: format,
      },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Export transactions error:', error);
    throw error;
  }
};

export const chatWithBot = async (message, session_id, token = DEFAULT_TOKEN) => {
  try {
    const response = await apiClient.post(
      `${BASE_URL}/chat/chatbot/message`,
      {
        message: message,
        session_id: session_id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    throw error;
  }
};

export const getOrCreateSession = async (token = DEFAULT_TOKEN) => {
  try {
    const response = await apiClient.post(
      `${BASE_URL}/chat/chatbot/session`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Session error:', error.response?.data || error.message);
    throw error;
  }
};

export const getProfile = async (token) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/profile`, {
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

// Utility functions
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please select a JPG or PNG image.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }

  return true;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Default export for backward compatibility
export default {
  scanReceipt,
  chatWithBot,
  getOrCreateSession,
  getProfile,
  transcribeVoice,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  login,
  register,
  logout,
  getCurrentUser,
  getCategories,
  getExpenseStats,
  exportTransactions,
  validateImageFile,
  formatCurrency,
  formatDate,
};
