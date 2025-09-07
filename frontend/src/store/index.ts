import { configureStore } from '@reduxjs/toolkit';
import ticketSlice from './ticketSlice';
import agentSlice from './agentSlice';
import uiSlice from './uiSlice';

export const store = configureStore({
  reducer: {
    tickets: ticketSlice,
    agents: agentSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
