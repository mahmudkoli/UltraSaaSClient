import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import api from 'src/API/api';
import { RootState } from 'src/store';
import { Skill } from 'src/common/Entity/Skill';

//type of data or entity
export interface ExampleState {
  list: Skill[];
  userName: string | null;
  status: 'idle' | 'loading' | 'success' | 'failed';
}

//initial state of certain type
const initialState: ExampleState = {
  list: [],
  userName: null,
  status: 'idle'
}

//api call using redux thunk
export const fetchExampleList = createAsyncThunk('/skill/get', async () => {
  const response = await api.Example.get();
  return response;
});

//post request, put and delete smiliar way.
export const addExample = createAsyncThunk('/skill/add', async (data: any) => {
  const response = await api.Example.add(data);
  return response;
});




const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    exampleList(state, action) {
      console.log(action);
      state.list = [...action.payload];
      return state;
    }
  },
  extraReducers(builder) {

    builder.addCase(fetchExampleList.pending, (state, action) => {
      state.status = 'loading';
    });

    builder.addCase(fetchExampleList.fulfilled, (state, action) => {
      state.status = 'success';
      console.log(action);
      state.list = [...action.payload];

    })
  },
});


export const selectAllExample  = (state : RootState) => state.example.list;
export const exampleStatus = (state : RootState) => state.example.status;
export const exampleUserName = (state : RootState) => state.example.userName;



export const {exampleList} = exampleSlice.actions;
export default exampleSlice;




