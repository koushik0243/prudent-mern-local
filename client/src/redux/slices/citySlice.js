import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiServiceHandler from '../../service/apiService';

export const fetchCities = createAsyncThunk(
  'cityMaster/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', 'city/list');

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cities');
    }
  }
);

export const createCity = createAsyncThunk(
  'cityMaster/createCity',
  async (cityData, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('POST', 'city/create', cityData);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create city');
    }
  }
);

export const updateCity = createAsyncThunk(
  'cityMaster/updateCity',
  async ({ id, cityData }, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('PUT', `city/update/${id}`, cityData);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update city');
    }
  }
);

export const deleteCity = createAsyncThunk(
  'cityMaster/deleteCity',
  async (id, { rejectWithValue }) => {
    try {
      await apiServiceHandler('GET', `city/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete city');
    }
  }
);

export const fetchCityById = createAsyncThunk(
  'cityMaster/fetchCityById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `city/edit/${id}`);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch city');
    }
  }
);

const initialState = {
  cities: [],
  currentCity: null,
  loading: false,
  error: null,
};

const citySlice = createSlice({
  name: 'cityMaster',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCity: (state) => {
      state.currentCity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCity.fulfilled, (state, action) => {
        state.loading = false;
        state.cities.push(action.payload);
      })
      .addCase(createCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cities.findIndex(
          item => (item._id || item.id) === (action.payload._id || action.payload.id)
        );
        if (index !== -1) {
          state.cities[index] = action.payload;
        }
      })
      .addCase(updateCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCity.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = state.cities.filter(
          item => (item._id || item.id) !== action.payload
        );
      })
      .addCase(deleteCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCityById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCity = action.payload;
      })
      .addCase(fetchCityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentCity } = citySlice.actions;
export default citySlice.reducer;
