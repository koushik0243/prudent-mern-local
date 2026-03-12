import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import contactsReducer from './slices/contactsSlice';
import tagManagerReducer from './slices/tagManagerSlice';
import stagesReducer from './slices/stagesSlice';
import countryReducer from './slices/countrySlice';
import stateReducer from './slices/stateSlice';
import cityReducer from './slices/citySlice';
import contactStageReducer from './slices/contactStageSlice';
import contactMailReducer from './slices/contactMailSlice';
import contactMailSendReducer from './slices/contactMailSendSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    contacts: contactsReducer,
    contactMail: contactMailReducer,
    contactMailSend: contactMailSendReducer,
    tagManager: tagManagerReducer,
    stages: stagesReducer,
    country: countryReducer,
    stateMaster: stateReducer,
    cityMaster: cityReducer,
    contactStage: contactStageReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
