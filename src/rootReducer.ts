import { combineReducers } from "redux";
import counterSlice from "./slices/counterSlice";
import exampleSlice from "./slices/exampleSlice";
import SingleValueTypeConfigSlice from "./slices/singleValueTypeConfigSlice";

const reducers = {
 counter : counterSlice.reducer,
 example: exampleSlice.reducer,
 singleValueTypeConfig: SingleValueTypeConfigSlice.reducer
}

export default combineReducers(reducers)