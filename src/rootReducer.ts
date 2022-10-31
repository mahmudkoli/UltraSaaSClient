import { combineReducers } from "redux";
import counterSlice from "./slices/counterSlice";
import exampleSlice from "./slices/exampleSlice";
import modalSlice from "./slices/modalSlice";
import SingleValueTypeConfigSlice from "./slices/singleValueTypeConfigSlice";

const reducers = {
 counter : counterSlice.reducer,
 example: exampleSlice.reducer,
 singleValueTypeConfig: SingleValueTypeConfigSlice.reducer,
 modal: modalSlice.reducer
}

export default combineReducers(reducers)