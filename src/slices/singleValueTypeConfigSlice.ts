import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "src/API/api";
import { SingleValueTypeConfig } from "src/common/Entity/SingleValueTypeConfig";
import { RootState } from "src/store";

export interface SingleValueTypeConfigState {
    items: SingleValueTypeConfig[];
}

const initialState: SingleValueTypeConfigState = {
    items:  [
        { id: "1", name: "Test 1", code: "code 1", description: "Dest 1" },
        { id: "2", name: "Test 2", code: "code 2", description: "Dest 2" },
      ]
}

const SingleValueTypeConfigSlice = createSlice({
    name: 'SingleValueTypeConfig',
    initialState,
    reducers: {
        handleSingleValueTypeConfig: (state, action) => {
            //const skills = state.items;
            console.log(state);
            console.log(action);
            state.items = [...action.payload];
            return state;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSingleValueTypeConfig.fulfilled, (state, action) => {
            console.log(action);
            state.items = action.payload
        }),
            builder.addCase(addSingleValueTypeConfig.fulfilled, (state, action) => {

            }),

            builder.addCase(updateSingleValueTypeConfig.fulfilled, (state, action) => {

            })
    },
})

//fetch SingleValueTypeConfig list
export const fetchSingleValueTypeConfig = createAsyncThunk('/skill', async () => {
    try {
        const res = await api.singleValueTypeConfig.get();
        return res;
    } catch (error) {
        return [];
    }
});

//create SingleValueTypeConfig
export const addSingleValueTypeConfig = createAsyncThunk('singleValueTypeConfig/add', async (payload: SingleValueTypeConfig, thunk) => {
    try {
        await api.singleValueTypeConfig.add(payload);
        thunk.dispatch(fetchSingleValueTypeConfig());

    } catch (error) {

    }
});

//update SingleValueTypeConfig
export const updateSingleValueTypeConfig = createAsyncThunk('singleValueTypeConfig/update', async (payload: SingleValueTypeConfig, thunk) => {
    try {
        await api.singleValueTypeConfig.update(payload.id!, payload);
        thunk.dispatch(fetchSingleValueTypeConfig());
    }
    catch (error) {

    }
})

//delete SingleValueTypeConfig
export const deleteSingleValueTypeConfig = createAsyncThunk('singleValueTypeConfig/delete', async (id: string, thunk) => {
    try {
        debugger;
        await api.singleValueTypeConfig.delete(id);
        thunk.dispatch(fetchSingleValueTypeConfig());
    } catch (error) {

    }
})

export const singleValueTypeConfigList = (state: RootState) => state.singleValueTypeConfig.items;

export const { handleSingleValueTypeConfig } = SingleValueTypeConfigSlice.actions;
export default SingleValueTypeConfigSlice;