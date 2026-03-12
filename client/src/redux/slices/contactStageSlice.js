import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiServiceHandler from '../../service/apiService';

// Initial state
const initialState = {
  contactStages: [],
  currentContactStage: null,
  loading: false,
  error: null,
};

// Async thunk for creating a contact-stage record
export const createContactStage = createAsyncThunk(
  'contactStage/createContactStage',
  async (contactStageData, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('POST', 'contact-stage/create', contactStageData);
      
      if (response.data) {
        return response.data;
      } else if (response.result) {
        return response.result;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create contact stage record');
    }
  }
);

// Async thunk for fetching contact stages by contact ID
export const fetchContactStagesByContactId = createAsyncThunk(
  'contactStage/fetchContactStagesByContactId',
  async (contactId, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `contact-stage/list/${contactId}`);

      if (response.data) {
        return response.data;
      } else if (response.result) {
        return response.result;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch contact stages');
    }
  }
);

const contactStageSlice = createSlice({
  name: 'contactStage',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearContactStages: (state) => {
      state.contactStages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create contact stage
      .addCase(createContactStage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContactStage.fulfilled, (state, action) => {
        state.loading = false;
        state.contactStages.unshift(action.payload);
        state.error = null;
      })
      .addCase(createContactStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch contact stages by contact ID
      .addCase(fetchContactStagesByContactId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactStagesByContactId.fulfilled, (state, action) => {
        state.loading = false;
        state.contactStages = action.payload;
      })
      .addCase(fetchContactStagesByContactId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearContactStages } = contactStageSlice.actions;
export default contactStageSlice.reducer;
