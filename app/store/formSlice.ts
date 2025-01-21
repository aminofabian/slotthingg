import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FormData } from '../../lib/query';

interface FormState {
  formData: Partial<FormData>;
  errors: Record<string, string> | null;
  isSubmitting: boolean;
}

const initialState: FormState = {
  formData: {},
  errors: null,
  isSubmitting: false,
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<Partial<FormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setErrors: (state, action: PayloadAction<Record<string, string> | null>) => {
      state.errors = action.payload;
    },
    setIsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    resetForm: (state) => {
      state.formData = {};
      state.errors = null;
      state.isSubmitting = false;
    },
  },
});

export const { setFormData, setErrors, setIsSubmitting, resetForm } = formSlice.actions;
export default formSlice.reducer; 