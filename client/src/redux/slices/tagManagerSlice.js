import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiServiceHandler from '../../service/apiService';

// Async thunk for fetching tag managers
export const fetchTagManagers = createAsyncThunk(
  'tagManager/fetchTagManagers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `tag-manager/list`);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tag managers');
    }
  }
);

// Async thunk for creating a tag manager
export const createTagManager = createAsyncThunk(
  'tagManager/createTagManager',
  async (tagData, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('POST', 'tag-manager/create', tagData);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create tag manager');
    }
  }
);

// Async thunk for updating a tag manager
export const updateTagManager = createAsyncThunk(
  'tagManager/updateTagManager',
  async ({ id, tagManagerData }, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('PUT', `tag-manager/update/${id}`, tagManagerData);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update tag manager');
    }
  }
);

// Async thunk for deleting a tag manager
export const deleteTagManager = createAsyncThunk(
  'tagManager/deleteTagManager',
  async (id, { rejectWithValue }) => {
    try {
      await apiServiceHandler('GET', `tag-manager/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete tag manager');
    }
  }
);

// Async thunk for fetching single tag manager
export const fetchTagManagerById = createAsyncThunk(
  'tagManager/fetchTagManagerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `tag-manager/edit/${id}`);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tag manager');
    }
  }
);

const initialState = {
  tagManagers: [],
  currentTagManager: null,
  loading: false,
  error: null,
};

const tagManagerSlice = createSlice({
  name: 'tagManager',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTagManager: (state) => {
      state.currentTagManager = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tag managers
      .addCase(fetchTagManagers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTagManagers.fulfilled, (state, action) => {
        state.loading = false;
        state.tagManagers = action.payload;
      })
      .addCase(fetchTagManagers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create tag manager
      .addCase(createTagManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTagManager.fulfilled, (state, action) => {
        state.loading = false;
        state.tagManagers.push(action.payload);
      })
      .addCase(createTagManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update tag manager
      .addCase(updateTagManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTagManager.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tagManagers.findIndex(
          tag => (tag._id || tag.id) === (action.payload._id || action.payload.id)
        );
        if (index !== -1) {
          state.tagManagers[index] = action.payload;
        }
      })
      .addCase(updateTagManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete tag manager
      .addCase(deleteTagManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTagManager.fulfilled, (state, action) => {
        state.loading = false;
        state.tagManagers = state.tagManagers.filter(
          tag => (tag._id || tag.id) !== action.payload
        );
      })
      .addCase(deleteTagManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch tag manager by ID
      .addCase(fetchTagManagerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTagManagerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTagManager = action.payload;
      })
      .addCase(fetchTagManagerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTagManager } = tagManagerSlice.actions;
export default tagManagerSlice.reducer;
