import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiServiceHandler from '../../service/apiService';

const COUNTRY_LIST_TTL_MS = 5 * 60 * 1000;

export const fetchCountries = createAsyncThunk(
  'country/fetchCountries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', 'country/list');

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch countries');
    }
  },
  {
    condition: (_, { getState }) => {
      const { country } = getState();
      const hasData = Array.isArray(country?.countries) && country.countries.length > 0;
      const isFresh = hasData && (Date.now() - (country.lastFetchedAt || 0) < COUNTRY_LIST_TTL_MS);

      if (country?.loading) return false;
      if (isFresh) return false;
      return true;
    },
  }
);

export const createCountry = createAsyncThunk(
  'country/createCountry',
  async (countryData, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('POST', 'country/create', countryData);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create country');
    }
  }
);

export const updateCountry = createAsyncThunk(
  'country/updateCountry',
  async ({ id, countryData }, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('PUT', `country/update/${id}`, countryData);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update country');
    }
  }
);

export const deleteCountry = createAsyncThunk(
  'country/deleteCountry',
  async (id, { rejectWithValue }) => {
    try {
      await apiServiceHandler('GET', `country/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete country');
    }
  }
);

export const fetchCountryById = createAsyncThunk(
  'country/fetchCountryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `country/edit/${id}`);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch country');
    }
  },
  {
    condition: (id, { getState }) => {
      const { country } = getState();
      const normalizedRequestedId = String(id || '');
      const current = country?.currentCountry;
      const currentId = String(current?._id || current?.id || country?.currentCountryId || '');

      if (country?.loading) return false;
      if (normalizedRequestedId && current && currentId === normalizedRequestedId) return false;
      return true;
    },
  }
);

const initialState = {
  countries: [],
  currentCountry: null,
  currentCountryId: null,
  lastFetchedAt: 0,
  loading: false,
  error: null,
};

const countrySlice = createSlice({
  name: 'country',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCountry: (state) => {
      state.currentCountry = null;
      state.currentCountryId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.countries.push(action.payload);
        state.currentCountry = action.payload;
        state.currentCountryId = action.payload?._id || action.payload?.id || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(createCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCountry.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.countries.findIndex(
          country => (country._id || country.id) === (action.payload._id || action.payload.id)
        );
        if (index !== -1) {
          state.countries[index] = action.payload;
        }
        state.currentCountry = action.payload;
        state.currentCountryId = action.payload?._id || action.payload?.id || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(updateCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = state.countries.filter(
          country => (country._id || country.id) !== action.payload
        );

        if ((state.currentCountry?._id || state.currentCountry?.id) === action.payload) {
          state.currentCountry = null;
          state.currentCountryId = null;
        }

        state.lastFetchedAt = Date.now();
      })
      .addCase(deleteCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCountryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCountry = action.payload;
        state.currentCountryId = action.payload?._id || action.payload?.id || null;
      })
      .addCase(fetchCountryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentCountry } = countrySlice.actions;
export default countrySlice.reducer;