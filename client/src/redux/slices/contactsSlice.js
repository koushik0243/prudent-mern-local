import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiServiceHandler from '../../service/apiService';

const CONTACT_LIST_TTL_MS = 5 * 60 * 1000;

// Async thunk for fetching contacts
export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `contact/list`);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch contacts');
    }
  },
  {
    condition: (_, { getState }) => {
      const { contacts } = getState();
      const hasFetchedRecently = Date.now() - (contacts?.lastFetchedAt || 0) < CONTACT_LIST_TTL_MS;

      if (contacts?.loading) return false;
      if (hasFetchedRecently) return false;
      return true;
    },
  }
);

// Async thunk for creating a contact
export const createContact = createAsyncThunk(
  'contacts/createContact',
  async (contactData, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('POST', 'contact/create', contactData);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create contact');
    }
  }
);

// Async thunk for updating a contact
export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async ({ id, contactData }, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('PUT', `contact/update/${id}`, contactData);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update contact');
    }
  }
);

// Async thunk for deleting a contact
export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (id, { rejectWithValue }) => {
    try {
      await apiServiceHandler('GET', `contact/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete contact');
    }
  }
);

// Async thunk for fetching single contact
export const fetchContactById = createAsyncThunk(
  'contacts/fetchContactById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiServiceHandler('GET', `contact/edit/${id}`);
      
      if (response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch contact');
    }
  }
);

const initialState = {
  contacts: [],
  currentContact: null,
  lastFetchedAt: 0,
  loading: false,
  error: null,
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentContact: (state) => {
      state.currentContact = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch contacts
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create contact
      .addCase(createContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts.push(action.payload);
        state.lastFetchedAt = Date.now();
      })
      .addCase(createContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update contact
      .addCase(updateContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.contacts.findIndex(
          contact => (contact._id || contact.id) === (action.payload._id || action.payload.id)
        );
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
        state.lastFetchedAt = Date.now();
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete contact
      .addCase(deleteContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = state.contacts.filter(
          contact => (contact._id || contact.id) !== action.payload
        );
        state.lastFetchedAt = Date.now();
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch contact by ID
      .addCase(fetchContactById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContact = action.payload;
      })
      .addCase(fetchContactById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentContact } = contactsSlice.actions;
export default contactsSlice.reducer;
