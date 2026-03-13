import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiServiceHandler from '../../service/apiService';
import { API_URL } from '@/lib/constant';

const USER_LIST_TTL_MS = 5 * 60 * 1000;

// Async thunk for login
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('POST', 'user/admin/login', credentials);

      // Log the response for debugging
      console.log('API Response:', response);

      // Check if response is an error object (axios error)
      if (response.isAxiosError || response.response) {
        const errorMessage = response.response?.data?.message ||
                           response.message ||
                           'Login failed. Please check your credentials.';
        console.error('Axios Error:', errorMessage);
        return rejectWithValue(errorMessage);
      }

      // Check if response has data object with secret (token)
      if (response.data && response.data.secret) {
        localStorage.setItem('adminToken', response.data.secret);
        console.log('Login successful - token stored');
        return response.data;
      }

      // Check if response has token directly
      if (response.token || response.secret) {
        localStorage.setItem('adminToken', response.token || response.secret);
        console.log('Login successful - token stored');
        return response;
      }

      // Check if response has a success flag
      if (response.success === false) {
        console.error('Login failed - success is false:', response.message);
        return rejectWithValue(response.message || 'Login failed');
      }

      // If we get here, something unexpected happened
      console.error('Invalid response structure:', response);
      return rejectWithValue('Invalid response from server');
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.message || 'An error occurred during login');
    }
  }
);

export const requestLoginOtp = createAsyncThunk(
  'user/requestLoginOtp',
  async (payload, { rejectWithValue }) => {
    const otpRequestEndpoints = [
      'user/admin/login/request-otp',
      'user/admin/request-otp',
      'user/admin/login/requestotp',
    ];

    try {
      let response = null;
      let lastError = null;

      for (const endpoint of otpRequestEndpoints) {
        try {
          response = await apiServiceHandler('POST', endpoint, payload);
          break;
        } catch (error) {
          lastError = error;
          const isNotFoundError = String(error?.message || '').includes('404');
          if (!isNotFoundError) {
            throw error;
          }
        }
      }

      if (!response) {
        throw lastError || new Error('Failed to send OTP');
      }

      if (response.success === false) {
        return rejectWithValue(response.message || 'Failed to send OTP');
      }

      if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return {
          ...response,
          ...response.data,
        };
      }

      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send OTP');
    }
  }
);

export const verifyLoginOtp = createAsyncThunk(
  'user/verifyLoginOtp',
  async (payload, { rejectWithValue }) => {
    const otpVerifyEndpoints = [
      'user/admin/login/verify-otp',
      'user/admin/verify-otp',
      'user/admin/login/verifyotp',
    ];

    try {
      let response = null;
      let lastError = null;

      for (const endpoint of otpVerifyEndpoints) {
        try {
          response = await apiServiceHandler('POST', endpoint, payload);
          break;
        } catch (error) {
          lastError = error;
          const isNotFoundError = String(error?.message || '').includes('404');
          if (!isNotFoundError) {
            throw error;
          }
        }
      }

      if (!response) {
        throw lastError || new Error('OTP verification failed');
      }

      if (response.success === false) {
        return rejectWithValue(response.message || 'OTP verification failed');
      }

      const responseData = response.data || response;
      const token = responseData.secret || responseData.token;

      if (!token) {
        return rejectWithValue('Invalid response from server');
      }

      localStorage.setItem('adminToken', token);
      return responseData;
    } catch (error) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

// Async thunk for fetching users
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', 'user/list');
      
      if (response.data) {
        return response.data;
      } else if (response.result) {
        return response.result;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  },
  {
    condition: (_, { getState }) => {
      const { user } = getState();
      const hasFetchedRecently = Date.now() - (user?.lastFetchedAt || 0) < USER_LIST_TTL_MS;

      if (user?.loading) return false;
      if (hasFetchedRecently) return false;
      return true;
    },
  }
);

// Async thunk for fetching user by ID
export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `user/edit/${userId}`);
      
      if (response.data) {
        return response.data;
      } else if (response.result) {
        return response.result;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user');
    }
  },
  {
    condition: (userId, { getState }) => {
      const { user } = getState();
      const normalizedRequestedId = String(userId || '');
      const current = user?.currentUser;
      const currentId = String(current?._id || current?.id || user?.currentUserId || '');

      if (user?.loading) return false;
      if (normalizedRequestedId && current && currentId === normalizedRequestedId) return false;
      return true;
    },
  }
);

// Async thunk for creating a user
export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('POST', 'user/create', userData);
      
      if (response.data) {
        return response.data;
      } else if (response.result) {
        return response.result;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create user');
    }
  }
);

// Async thunk for updating a user
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('PUT', `user/update/${id}`, userData);
      
      if (response.data) {
        return response.data;
      } else if (response.result) {
        return response.result;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update user');
    }
  }
);

// Async thunk for deleting a user
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await apiServiceHandler('GET', `user/delete/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete user');
    }
  }
);

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async ({ id, passwordData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return rejectWithValue('Authentication token not found. Please login again.');
      }

      const response = await fetch(API_URL + `/user/change-password/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to change password');
      }

      const data = await response.json();

      if (data.data) {
        return data.data;
      } else if (data.result) {
        return data.result;
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

const initialState = {
  users: [],
  currentUser: null,
  currentUserId: null,
  lastFetchedAt: 0,
  isAuthenticated: false,
  otpRequested: false,
  otpChallenge: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.currentUserId = action.payload?._id || action.payload?.id || null;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.currentUserId = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.currentUserId = null;
    },
    clearOtpState: (state) => {
      state.otpRequested = false;
      state.otpChallenge = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user || action.payload;
        state.currentUserId = (action.payload.user || action.payload)?._id || (action.payload.user || action.payload)?.id || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(requestLoginOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestLoginOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;
        state.otpRequested = true;
        state.otpChallenge =
          action.payload.challengeId ||
          action.payload.challenge_id ||
          action.payload.requestId ||
          null;
      })
      .addCase(requestLoginOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.otpRequested = false;
        state.otpChallenge = null;
      })
      .addCase(verifyLoginOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user || action.payload;
        state.currentUserId = (action.payload.user || action.payload)?._id || (action.payload.user || action.payload)?.id || null;
        state.isAuthenticated = true;
        state.otpRequested = false;
        state.otpChallenge = null;
        state.error = null;
      })
      .addCase(verifyLoginOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.currentUserId = action.payload?._id || action.payload?.id || null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.currentUser = action.payload;
        state.currentUserId = action.payload?._id || action.payload?.id || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (entry) => (entry._id || entry.id) === (action.payload?._id || action.payload?.id)
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.currentUser = action.payload;
        state.currentUserId = action.payload?._id || action.payload?.id || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          user => (user._id || user.id) !== action.payload
        );

        if ((state.currentUser?._id || state.currentUser?.id) === action.payload) {
          state.currentUser = null;
          state.currentUserId = null;
        }

        state.lastFetchedAt = Date.now();
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentUser, logout, clearError, clearCurrentUser, clearOtpState } = userSlice.actions;
export default userSlice.reducer;
