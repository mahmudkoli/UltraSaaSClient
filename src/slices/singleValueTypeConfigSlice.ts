import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "src/API/api";
import { QueryObject } from "src/common/Entity/QueryObject";
import { SingleValueTypeConfig } from "src/common/Entity/SingleValueTypeConfig";
import { RootState } from "src/store";

export interface SingleValueTypeConfigState {
    items: SingleValueTypeConfig[];
}

const initialState: SingleValueTypeConfigState = {
    items: [
        { id: "1", name: "Test 1", code: "code 1", description: "Dest 1" },
        { id: "2", name: "Test 2", code: "code 2", description: "Dest 2" },
    ]
}

const SingleValueTypeConfigSlice = createSlice({
    name: 'SingleValueTypeConfig',
    initialState,
    reducers: {
        handleSingleValueTypeConfig: (state, action) => {
            state.items = [...action.payload];
            return state;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSingleValueTypeConfigList.fulfilled, (state, action) => {
            state.items = action.payload
        }),
        builder.addCase(addSingleValueTypeConfig.fulfilled, (state, action) => {

        }),
        builder.addCase(updateSingleValueTypeConfig.fulfilled, (state, action) => {

        })
    },
})

//fetch SingleValueTypeConfig list
export const fetchSingleValueTypeConfigList = createAsyncThunk('/singleValueTypeConfig', async (queryObject: QueryObject) => {
    try {
        const res = await api.singleValueTypeConfigApi.get(queryObject);
        return res;
    } catch (error) {
        // return [];
        return initialState.items;
    }
});

//create SingleValueTypeConfig
export const addSingleValueTypeConfig = createAsyncThunk('singleValueTypeConfig/add', async (payload: SingleValueTypeConfig, thunk) => {
    try {
        await api.singleValueTypeConfigApi.add(payload);
        thunk.dispatch(fetchSingleValueTypeConfigList(new QueryObject()));

    } catch (error) {

    }
});

//update SingleValueTypeConfig
export const updateSingleValueTypeConfig = createAsyncThunk('singleValueTypeConfig/update', async (payload: SingleValueTypeConfig, thunk) => {
    try {
        await api.singleValueTypeConfigApi.update(payload.id!, payload);
        thunk.dispatch(fetchSingleValueTypeConfigList(new QueryObject()));
    }
    catch (error) {

    }
})

//delete SingleValueTypeConfig
export const deleteSingleValueTypeConfig = createAsyncThunk('singleValueTypeConfig/delete', async (id: string, thunk) => {
    try {
        await api.singleValueTypeConfigApi.delete(id);
        thunk.dispatch(fetchSingleValueTypeConfigList(new QueryObject()));
    } catch (error) {

    }
})

export const singleValueTypeConfigList = (state: RootState) => state.singleValueTypeConfig.items;

export const { handleSingleValueTypeConfig } = SingleValueTypeConfigSlice.actions;
export default SingleValueTypeConfigSlice;