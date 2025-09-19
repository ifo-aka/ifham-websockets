import { createSlice } from "@reduxjs/toolkit";







const uiSlice = createSlice({
    name : "ui",
    initialState:{
        isMobileDimention :false,
        isDesktopDimention: true,

    },
    reducers : {
     setIsMobileDimention (state, action){
        state.isMobileDimention=!!action.payload;
        state.isDesktopDimention=!action.payload;
     },
     setIsDesktopDimention(state,action){
        state.isDesktopDimention = !!action.payload;
        state.isMobileDimention = !action.payload;
     },
    }
})
export const {setIsDesktopDimention,setIsMobileDimention} =uiSlice.actions;
export default uiSlice.reducer;
