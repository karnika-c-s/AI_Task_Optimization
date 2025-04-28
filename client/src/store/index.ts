import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './slices/taskSlice';
import employeeReducer from './slices/employeeSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    employees: employeeReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
