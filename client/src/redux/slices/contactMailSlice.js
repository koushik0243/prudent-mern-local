import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiServiceHandler from '../../service/apiService';

const CONTACT_MAIL_LIST_TTL_MS = 5 * 60 * 1000;

export const fetchContactMails = createAsyncThunk(
  'contactMail/fetchContactMails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', 'contact-mail/list');

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch contact mails');
    }
  },
  {
    condition: (_, { getState }) => {
      const { contactMail } = getState();
      const hasData = Array.isArray(contactMail?.contactMails) && contactMail.contactMails.length > 0;
      const isFresh = hasData && (Date.now() - (contactMail.lastFetchedAt || 0) < CONTACT_MAIL_LIST_TTL_MS);

      if (contactMail?.loading) return false;
      if (isFresh) return false;
      return true;
    },
  }
);

export const createContactMail = createAsyncThunk(
  'contactMail/createContactMail',
  async (contactMailData, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('POST', 'contact-mail/create', contactMailData);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create contact mail');
    }
  }
);

export const updateContactMail = createAsyncThunk(
  'contactMail/updateContactMail',
  async ({ id, contactMailData }, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('PUT', `contact-mail/update/${id}`, contactMailData);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update contact mail');
    }
  }
);

export const deleteContactMail = createAsyncThunk(
  'contactMail/deleteContactMail',
  async (id, { rejectWithValue }) => {
    try {
      await apiServiceHandler('GET', `contact-mail/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete contact mail');
    }
  }
);

export const fetchContactMailById = createAsyncThunk(
  'contactMail/fetchContactMailById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `contact-mail/edit/${id}`);

      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch contact mail');
    }
  },
  {
    condition: (id, { getState }) => {
      const { contactMail } = getState();
      const normalizedRequestedId = String(id || '');
      const current = contactMail?.currentContactMail;
      const currentId = String(current?._id || current?.id || contactMail?.currentContactMailId || '');

      if (contactMail?.loading) return false;
      if (normalizedRequestedId && current && currentId === normalizedRequestedId) return false;
      return true;
    },
  }
);

const initialState = {
  contactMails: [],
  currentContactMail: null,
  currentContactMailId: null,
  lastFetchedAt: 0,
  loading: false,
  error: null,
};

const contactMailSlice = createSlice({
  name: 'contactMail',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentContactMail: (state) => {
      state.currentContactMail = null;
      state.currentContactMailId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactMails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactMails.fulfilled, (state, action) => {
        state.loading = false;
        state.contactMails = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchContactMails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createContactMail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContactMail.fulfilled, (state, action) => {
        state.loading = false;
        state.contactMails.push(action.payload);
        state.lastFetchedAt = Date.now();
      })
      .addCase(createContactMail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateContactMail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContactMail.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.contactMails.findIndex(
          (item) => (item._id || item.id) === (action.payload._id || action.payload.id)
        );
        if (index !== -1) {
          state.contactMails[index] = action.payload;
        }
        state.currentContactMail = action.payload;
        state.currentContactMailId = action.payload?._id || action.payload?.id || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(updateContactMail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteContactMail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContactMail.fulfilled, (state, action) => {
        state.loading = false;
        state.contactMails = state.contactMails.filter(
          (item) => (item._id || item.id) !== action.payload
        );

        if ((state.currentContactMail?._id || state.currentContactMail?.id) === action.payload) {
          state.currentContactMail = null;
          state.currentContactMailId = null;
        }

        state.lastFetchedAt = Date.now();
      })
      .addCase(deleteContactMail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchContactMailById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactMailById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContactMail = action.payload;
        state.currentContactMailId = action.payload?._id || action.payload?.id || null;
      })
      .addCase(fetchContactMailById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentContactMail } = contactMailSlice.actions;
export default contactMailSlice.reducer;
