import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiServiceHandler from '../../service/apiService';

const STATE_LIST_TTL_MS = 5 * 60 * 1000;

export const fetchStates = createAsyncThunk(
  'stateMaster/fetchStates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', 'state/list');

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch states');
    }
  },
  {
    condition: (_, { getState }) => {
      const { stateMaster } = getState();
      const hasFetchedRecently = Date.now() - (stateMaster?.lastFetchedAt || 0) < STATE_LIST_TTL_MS;

      if (stateMaster?.loading) return false;
      if (hasFetchedRecently) return false;
      return true;
    },
  }
);

export const createState = createAsyncThunk(
  'stateMaster/createState',
  async (stateData, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('POST', 'state/create', stateData);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create state');
    }
  }
);

export const updateState = createAsyncThunk(
  'stateMaster/updateState',
  async ({ id, stateData }, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('PUT', `state/update/${id}`, stateData);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update state');
    }
  }
);

export const deleteState = createAsyncThunk(
  'stateMaster/deleteState',
  async (id, { rejectWithValue }) => {
    try {
      await apiServiceHandler('GET', `state/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete state');
    }
  }
);

export const fetchStateById = createAsyncThunk(
  'stateMaster/fetchStateById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `state/edit/${id}`);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch state');
    }
  },
  {
    condition: (id, { getState }) => {
      const { stateMaster } = getState();
      const normalizedRequestedId = String(id || '');
      const current = stateMaster?.currentState;
      const currentId = String(current?._id || current?.id || stateMaster?.currentStateId || '');

      if (stateMaster?.loading) return false;
      if (normalizedRequestedId && current && currentId === normalizedRequestedId) return false;
      return true;
    },
  }
);

const initialState = {
  states: [],
  currentState: null,
  currentStateId: null,
  lastFetchedAt: 0,
  loading: false,
  error: null,
};

const stateSlice = createSlice({
  name: 'stateMaster',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentState: (state) => {
      state.currentState = null;
      state.currentStateId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createState.fulfilled, (state, action) => {
        state.loading = false;
        state.states.push(action.payload);
        state.currentState = action.payload;
        state.currentStateId = action.payload?._id || action.payload?.id || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(createState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateState.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.states.findIndex(
          item => (item._id || item.id) === (action.payload._id || action.payload.id)
        );
        if (index !== -1) {
          state.states[index] = action.payload;
        }
        state.currentState = action.payload;
        state.currentStateId = action.payload?._id || action.payload?.id || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(updateState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteState.fulfilled, (state, action) => {
        state.loading = false;
        state.states = state.states.filter(
          item => (item._id || item.id) !== action.payload
        );

        if ((state.currentState?._id || state.currentState?.id) === action.payload) {
          state.currentState = null;
          state.currentStateId = null;
        }

        state.lastFetchedAt = Date.now();
      })
      .addCase(deleteState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStateById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentState = action.payload;
        state.currentStateId = action.payload?._id || action.payload?.id || null;
      })
      .addCase(fetchStateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentState } = stateSlice.actions;
export default stateSlice.reducer;
