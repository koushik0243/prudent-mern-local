import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiServiceHandler from '../../service/apiService';

const CONTACT_MAIL_SEND_LIST_TTL_MS = 5 * 60 * 1000;

export const fetchContactMailSends = createAsyncThunk(
  'contactMailSend/fetchContactMailSends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', 'contact-send-mail/list');

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch contact mail sends');
    }
  },
  {
    condition: (_, { getState }) => {
      const { contactMailSend } = getState();
      const hasData = Array.isArray(contactMailSend?.contactMailSends) && contactMailSend.contactMailSends.length > 0;
      const isFresh = hasData && (Date.now() - (contactMailSend.lastFetchedAt || 0) < CONTACT_MAIL_SEND_LIST_TTL_MS);

      if (contactMailSend?.loading) return false;
      if (isFresh) return false;
      return true;
    },
  }
);

export const createContactMailSend = createAsyncThunk(
  'contactMailSend/createContactMailSend',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('POST', 'contact-send-mail/create', payload);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create contact mail send');
    }
  }
);

export const updateContactMailSend = createAsyncThunk(
  'contactMailSend/updateContactMailSend',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('PUT', `contact-send-mail/update/${id}`, payload);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update contact mail send');
    }
  }
);

export const deleteContactMailSend = createAsyncThunk(
  'contactMailSend/deleteContactMailSend',
  async (id, { rejectWithValue }) => {
    try {
      await apiServiceHandler('GET', `contact-send-mail/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete contact mail send');
    }
  }
);

export const fetchContactMailSendById = createAsyncThunk(
  'contactMailSend/fetchContactMailSendById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `contact-send-mail/edit/${id}`);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch contact mail send');
    }
  },
  {
    condition: (id, { getState }) => {
      const { contactMailSend } = getState();
      const normalizedRequestedId = String(id || '');
      const current = contactMailSend?.currentContactMailSend;
      const currentId = String(current?._id || current?.id || contactMailSend?.currentContactMailSendId || '');

      if (contactMailSend?.loading) return false;
      if (normalizedRequestedId && current && currentId === normalizedRequestedId) return false;
      return true;
    },
  }
);

const initialState = {
  contactMailSends: [],
  currentContactMailSend: null,
  currentContactMailSendId: null,
  lastFetchedAt: 0,
  loading: false,
  error: null,
};

const contactMailSendSlice = createSlice({
  name: 'contactMailSend',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentContactMailSend: (state) => {
      state.currentContactMailSend = null;
      state.currentContactMailSendId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactMailSends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactMailSends.fulfilled, (state, action) => {
        state.loading = false;
        state.contactMailSends = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchContactMailSends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createContactMailSend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContactMailSend.fulfilled, (state, action) => {
        state.loading = false;
        state.contactMailSends.push(action.payload);
        state.currentContactMailSend = action.payload;
        state.currentContactMailSendId = action.payload?._id || action.payload?.id || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(createContactMailSend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateContactMailSend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContactMailSend.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.contactMailSends.findIndex(
          (item) => (item._id || item.id) === (action.payload._id || action.payload.id)
        );
        if (index !== -1) {
          state.contactMailSends[index] = action.payload;
        }
        state.currentContactMailSend = action.payload;
        state.currentContactMailSendId = action.payload?._id || action.payload?.id || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(updateContactMailSend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteContactMailSend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContactMailSend.fulfilled, (state, action) => {
        state.loading = false;
        state.contactMailSends = state.contactMailSends.filter(
          (item) => (item._id || item.id) !== action.payload
        );

        if ((state.currentContactMailSend?._id || state.currentContactMailSend?.id) === action.payload) {
          state.currentContactMailSend = null;
          state.currentContactMailSendId = null;
        }

        state.lastFetchedAt = Date.now();
      })
      .addCase(deleteContactMailSend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchContactMailSendById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactMailSendById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContactMailSend = action.payload;
        state.currentContactMailSendId = action.payload?._id || action.payload?.id || null;
      })
      .addCase(fetchContactMailSendById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentContactMailSend } = contactMailSendSlice.actions;
export default contactMailSendSlice.reducer;
