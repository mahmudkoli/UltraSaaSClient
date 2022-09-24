import { combineReducers } from "redux";
import counterSlice from "./slices/counterSlice";
import exampleSlice from "./slices/exampleSlice";

const reducers = {
 counter : counterSlice.reducer,
 example: exampleSlice.reducer
}

export default combineReducers(reducers)