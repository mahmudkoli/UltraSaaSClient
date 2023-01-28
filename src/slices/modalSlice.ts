import { createSlice } from '@reduxjs/toolkit'
import { RootState } from 'src/store'

export interface ModalState {
  flag: boolean
}

const initialState: ModalState = {
  flag: false
}

export const modalSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    openModal: (state) => {
      state.flag = true;
    },
    closeModal : (state) => {
      state.flag = false;
    }
  },
})

// Action creators are generated for each case reducer function
export const modalFlagState  = (state : RootState) => state.modal.flag;


export const { openModal, closeModal } = modalSlice.actions
export default modalSlice;