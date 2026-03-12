import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiServiceHandler from '../../service/apiService';

const STAGE_LIST_TTL_MS = 5 * 60 * 1000;

// Async thunk for fetching stages
export const fetchStages = createAsyncThunk(
  'stages/fetchStages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `stage/list`);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch stages');
    }
  },
  {
    condition: (_, { getState }) => {
      const { stages } = getState();
      const hasData = Array.isArray(stages?.stages) && stages.stages.length > 0;
      const isFresh = hasData && (Date.now() - (stages.lastFetchedAt || 0) < STAGE_LIST_TTL_MS);

      if (stages?.loading) return false;
      if (isFresh) return false;
      return true;
    },
  }
);

// Async thunk for creating a stage
export const createStage = createAsyncThunk(
  'stages/createStage',
  async (stageData, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('POST', 'stage/create', stageData);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create stage');
    }
  }
);

// Async thunk for updating a stage
export const updateStage = createAsyncThunk(
  'stages/updateStage',
  async ({ id, stageData }, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('PUT', `stage/update/${id}`, stageData);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update stage');
    }
  }
);

// Async thunk for deleting a stage
export const deleteStage = createAsyncThunk(
  'stages/deleteStage',
  async (id, { rejectWithValue }) => {
    try {
      await apiServiceHandler('GET', `stage/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete stage');
    }
  }
);

// Async thunk for fetching single stage
export const fetchStageById = createAsyncThunk(
  'stages/fetchStageById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `stage/edit/${id}`);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch stage');
    }
  },
  {
    condition: (id, { getState }) => {
      const { stages } = getState();
      const normalizedRequestedId = String(id || '');
      const current = stages?.currentStage;
      const currentId = String(current?._id || current?.id || stages?.currentStageId || '');

      if (stages?.loading) return false;
      if (normalizedRequestedId && current && currentId === normalizedRequestedId) return false;
      return true;
    },
  }
);

const initialState = {
  stages: [],
  currentStage: null,
  currentStageId: null,
  lastFetchedAt: 0,
  loading: false,
  error: null,
};

const stagesSlice = createSlice({
  name: 'stages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentStage: (state) => {
      state.currentStage = null;
      state.currentStageId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stages
      .addCase(fetchStages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStages.fulfilled, (state, action) => {
        state.loading = false;
        state.stages = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchStages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create stage
      .addCase(createStage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStage.fulfilled, (state, action) => {
        state.loading = false;
        state.stages.push(action.payload);
        state.currentStage = action.payload;
        state.currentStageId = action.payload?._id || action.payload?.id || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(createStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update stage
      .addCase(updateStage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stages.findIndex(
          stage => (stage._id || stage.id) === (action.payload._id || action.payload.id)
        );
        if (index !== -1) {
          state.stages[index] = action.payload;
        }
        state.currentStage = action.payload;
        state.currentStageId = action.payload?._id || action.payload?.id || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(updateStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete stage
      .addCase(deleteStage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStage.fulfilled, (state, action) => {
        state.loading = false;
        state.stages = state.stages.filter(
          stage => (stage._id || stage.id) !== action.payload
        );

        if ((state.currentStage?._id || state.currentStage?.id) === action.payload) {
          state.currentStage = null;
          state.currentStageId = null;
        }

        state.lastFetchedAt = Date.now();
      })
      .addCase(deleteStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch stage by ID
      .addCase(fetchStageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStageById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStage = action.payload;
        state.currentStageId = action.payload?._id || action.payload?.id || null;
      })
      .addCase(fetchStageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentStage } = stagesSlice.actions;
export default stagesSlice.reducer;
