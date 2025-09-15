import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
//import login , signup , refresh  api from DBUtils
import { login as dbLogin , signup as dbSignup, refreshToken as dbRefreshToken} from "../../utils/DBUtils";


export const signupThunk = createAsyncThunk("api/auth/signup", async (userData, { dispatch ,rejectWithValue}) => {
    dispatch(setShowSpinner(true));
    try {
        console.log(userData);
        
        const response = await dbSignup(userData);
        dispatch(setShowSpinner(false));
        if(!response.success){
            return rejectWithValue(response.error);
        }
        return response;
    } catch (error) {
        dispatch(setShowSpinner(false));
        return rejectWithValue("Network error or server is unreachable.");
    }
});
export const refreshTokenThunk = createAsyncThunk("api/auth/refresh", async (_, { dispatch ,rejectWithValue}) => {
    dispatch(setShowSpinner(true));
    try {
        const response = await dbRefreshToken();
        dispatch(setShowSpinner(false));
        if(!response.success){
            return rejectWithValue(response.error);
        }
        return response;
    } catch (error) {
        dispatch(setShowSpinner(false));
        return rejectWithValue("Network error or server is unreachable.");
    }
});


const authSlice = createSlice({
    name : "auth",
    initialState : {
        token: null,
        isAuthenticated: false,
        authChecked: false,
        showSpinner: false,
        userObject: {
            id: null,
            username: null,
            email: null,
        }
    },
    reducers : {
        logout : (state) =>{
            state.token = null;
            state.isAuthenticated = false;
            state.userObject = {id : null, username : null, email : null};
            localStorage.removeItem("token");
        },
        setShowSpinner : (state,action) =>{
            state.showSpinner = !!action.payload;
        },
        setAuthChecked : (state,action) =>{
            state.authChecked = !!action.payload;
        },
        setUserObject : (state,action) =>{
            state.userObject = {...state.userObject,...action.payload};
        },
        setToken : (state,action) =>{
            state.token = action.payload;
            state.isAuthenticated = !!action.payload;
        },
    },
    extraReducers : (builder) =>{
        builder
            .addCase(login.fulfilled, (state, action) =>{
                const {id,username,email,token} = action.payload.data;
                state.token = token;
                state.isAuthenticated = true;
                state.userObject = {id,username,email};
                localStorage.setItem("token", token);
            })
            .addCase(login.rejected, (state, action) =>{
                state.token = null;
                state.isAuthenticated = false;
                state.userObject = {id: null, username: null, email: null};
                localStorage.removeItem("token");
            })
            .addCase(login.pending, (state) =>{
                state.showSpinner = true;
            })
            .addCase(signupThunk.fulfilled, (state, action) =>{
                 const {id,username,email,token} = action.payload.data;
                 console.log(action.payload.data);
                 state.authChecked= true;
                state.token = token;
                state.isAuthenticated = true;
                state.userObject = {id,username,email};
                localStorage.setItem("token", token);
            })
            .addCase(signupThunk.rejected, (state, action) =>{
                state.token = null;
                state.isAuthenticated = false;
                state.userObject = {id: null, username: null, email: null};
                localStorage.removeItem("token");
            })
            .addCase(signupThunk.pending, (state) =>{
                state.showSpinner = true;
            })
            .addCase(refreshTokenThunk.fulfilled, (state, action) =>{
                 const {id,username,email,token} = action.payload.data;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.userObject = action.payload.user;
                localStorage.setItem("token", action.payload.token);
            })
            .addCase(refreshTokenThunk.rejected, (state, action) =>{
                state.token = null;
                state.isAuthenticated = false;
                state.userObject = {id: null, username: null, email: null};
                localStorage.removeItem("token");
            })
            .addCase(refreshTokenThunk.pending, (state) =>{
                state.showSpinner = true;
            });
    },
});

//===========================Async Thunks===================================
export const login = createAsyncThunk("auth/login", async (credentials, { dispatch }) => {
    dispatch(setShowSpinner(true));
    try {
        const response = await dbLogin(credentials);
        dispatch(setShowSpinner(false));
        return response;
    } catch (error) {
        dispatch(setShowSpinner(false));
        throw error;
    }
});

export default authSlice.reducer;
export const { logout, setShowSpinner, setAuthChecked, setUserObject, setToken } = authSlice.actions;