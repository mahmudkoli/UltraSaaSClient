// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import api from 'src/@core/utils/api'
import { RootState } from 'src/store'
import { PaginatedApiResponse } from 'src/types/apps/apiResponse'
import { QueryObject } from 'src/types/apps/common.types'
import { Institute } from "src/types/apps/institute";
import { closeModal } from '../modal'

const initialVaue: PaginatedApiResponse<Institute> = {
    currentPage: 1,
    totalPages: 2,
    totalCount: 20,
    pageSize: 10,
    hasPreviousPage: false,
    hasNextPage: true,
    data: []
}

//** get List */
export const fetchInstituteList = createAsyncThunk(
    '/institute',
    async (queryObject: QueryObject | null = null) => {
        try {
            const res = await api.institute.list(queryObject)

            return res
        } catch (error) {
            return initialVaue
        }
    }
)

// ** Add Event
export const addInstitute = createAsyncThunk(
    'institute/addEvent',
    async (payload: Institute, { dispatch }) => {
        try {
            await api.institute.create(payload)
        } catch (error) { }
        await dispatch(fetchInstituteList())
    }
)

// ** Update Event
export const updateInstitute = createAsyncThunk(
    'institute/updateEvent',
    async (payload: Institute, { dispatch }) => {
        try {
            await api.institute.edit(payload)
        } catch (error) { }
        dispatch(closeModal());
        await dispatch(fetchInstituteList())
    }
)

// ** Delete Event
export const deleteInstitute = createAsyncThunk(
    'institute/deleteEvent',
    async (id: string, { dispatch }) => {
        try {
            await api.institute.delete(id)
        } catch (error) { }
        await dispatch(fetchInstituteList())
    }
)


export const instituteSlice = createSlice({
    name: 'institute',
    initialState: {
        ...initialVaue
    },
    reducers: {
        handleInstitute: (state, action) => {
            state.data = [...action.payload.data]
            state.hasNextPage = action.payload.hasNextPage
            state.hasPreviousPage = action.payload.hasPreviousPage
            state.currentPage = action.payload.currentPage
            state.pageSize = action.payload.pageSize
            state.totalPages = action.payload.totalPages
            state.totalCount = action.payload.totalCount
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchInstituteList.fulfilled, (state, action) => {
            state.data = [...action.payload.data]
            state.hasNextPage = action.payload.hasNextPage
            state.hasPreviousPage = action.payload.hasPreviousPage
            state.currentPage = action.payload.currentPage
            state.pageSize = action.payload.pageSize
            state.totalPages = action.payload.totalPages
            state.totalCount = action.payload.totalCount
        })
    }
})

export const institutePaginatedList = (state: RootState) => state.institute;

export const { handleInstitute } = instituteSlice.actions;

export default instituteSlice.reducer;