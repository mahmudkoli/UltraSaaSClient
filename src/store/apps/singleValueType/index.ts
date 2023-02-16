// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import api from 'src/@core/utils/api'
import { RootState } from 'src/store'
import { PaginatedApiResponse } from 'src/types/apps/apiResponse'
import { QueryObject } from 'src/types/apps/common.types'
import { SingleValueType } from 'src/types/apps/singleValueTypes'

const initialVaue: PaginatedApiResponse<SingleValueType> = {
  currentPage: 1,
  totalPages: 2,
  totalCount: 20,
  pageSize: 10,
  hasPreviousPage: false,
  hasNextPage: true,
  data: []
}

//** get List */
export const fetchSingleValueTypeConfigList = createAsyncThunk(
  '/singleValueTypeConfig',
  async (queryObject: QueryObject | null = null) => {
    try {
      const res = await api.singleValue.list(queryObject)

      return res
    } catch (error) {
      return initialVaue
    }
  }
)

// ** Add Event
export const addSingleValueTypeConfig = createAsyncThunk(
  'singeValueType/addEvent',
  async (payload: SingleValueType, { dispatch }) => {
    try {
      await api.singleValue.create(payload)
    } catch (error) {}
    await dispatch(fetchSingleValueTypeConfigList())
  }
)

// ** Update Event
export const updateSingleValueTypeConfig = createAsyncThunk(
  'singeValueType/updateEvent',
  async (payload: SingleValueType, { dispatch }) => {
    try {
      await api.singleValue.edit(payload)
    } catch (error) {}
    await dispatch(fetchSingleValueTypeConfigList())
  }
)

// ** Delete Event
export const deleteSingleValueTypeConfig = createAsyncThunk(
  'singeValueType/deleteEvent',
  async (id: string, { dispatch }) => {
    try {
      await api.singleValue.delete(id)
    } catch (error) {}
    await dispatch(fetchSingleValueTypeConfigList())
  }
)

export const singleValueTypeSlice = createSlice({
  name: 'singleValueType',
  initialState: {
    ...initialVaue
  },
  reducers: {
    handleSingleValueType: (state, action) => {
      state.data = action.payload.data
      state.hasNextPage = action.payload.hasNextPage
      state.hasPreviousPage = action.payload.hasPreviousPage
      state.currentPage = action.payload.currentPage
      state.pageSize = action.payload.pageSize
      state.totalPages = action.payload.totalPages
      state.totalCount = action.payload.totalCount
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchSingleValueTypeConfigList.fulfilled, (state, action) => {
      state.data = action.payload.data
      state.hasNextPage = action.payload.hasNextPage
      state.hasPreviousPage = action.payload.hasPreviousPage
      state.currentPage = action.payload.currentPage
      state.pageSize = action.payload.pageSize
      state.totalPages = action.payload.totalPages
      state.totalCount = action.payload.totalCount
    })
  }
})

export const singleValueTypePaginatedList = (state: RootState) => state.singleValueType

export const { handleSingleValueType } = singleValueTypeSlice.actions

export default singleValueTypeSlice.reducer
